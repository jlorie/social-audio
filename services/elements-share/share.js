import UserModel from '../commons/resources/user-model';
import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';

import { notifySharedElement } from './notify';
import { logSharedElement } from './log-notification';
import { inviteUsers } from './invite.js';

const URI_USERS = process.env.URI_USERS;
const URI_ELEMENTS = process.env.URI_ELEMENTS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const MAX_RECIPIENTS = 25;

const userModel = new UserModel(URI_USERS);
const elementModel = new ElementModel(URI_ELEMENTS);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function shareElement(elementId, usernames, userId) {
  if (usernames.length > MAX_RECIPIENTS) {
    throw new Error('ShareLimitsExceeded');
  }
  console.info('Sharing element ' + elementId + ' with users ' + usernames.join(', '));

  // get element
  return elementModel.getById(elementId)
    .then(element => {
      if (!element) {
        throw new Error('InvalidElement');
      }

      // check permissions
      if (element.owner_id !== userId) {
        throw new Error('InvalidElementToShare');
      }

      // get recipients ids
      return userModel.getByUsernames(usernames)
        .then(users => {
          let recipientIds = users.map(user => user.id);
          let pendingUsers = usernames.filter(email => !users.find(u => u.username === email));

          // bind users with elements
          let bindings = getBindings(recipientIds, [element]);

          return elementsByUserModel.create(bindings)
            .then(() => notifySharedElement(element, userId, recipientIds))
            .then(() => {
              // notifying and logging
              let tasks = [logSharedElement(element, userId, recipientIds), // log
                inviteUsers(userId, pendingUsers) // inviting pending users
              ];
              return Promise.all(tasks);
            })
            .then(() => ({ message: 'OK' }));
        });
    });
}

export function shareMultipleElements(elementIds, recipients, userId) {
  console.info(`Sharing multiple elements [${elementIds.length}]`);

  let promises = [];
  for (let elementId of elementIds) {
    promises.push(shareElement(elementId, recipients, userId));
  }

  return Promise.all(promises)
    .then(() => ({ message: 'OK' }));
}

function getBindings(recipientIds, elements) {
  let bindings = [];

  for (let element of elements) {
    element.audios = element.audios || [];
    for (let id of recipientIds) {
      let binding = {
        id: element.id,
        user_id: id,
        created_at: element.created_at + '|visitor',
        thumbnail_url: element.thumbnail_url,
        audios: element.audios.filter(a => a.public).length,
        favorite: false
      };

      bindings.push(binding);
    }
  }

  return bindings;
}
