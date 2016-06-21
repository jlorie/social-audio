import _ from 'lodash';
import UserModel from '../commons/resources/user-model';
import ElementModel from '../commons/resources/element-model';

import { notifySharedElement } from './notify';
import { registerPendingUsers } from './pending-users';

const URI_USERS = process.env.URI_USERS;
const URI_ELEMENTS = process.env.URI_ELEMENTS;

const userModel = new UserModel(URI_USERS);
const elementModel = new ElementModel(URI_ELEMENTS);

export function shareElement(elementId, usernames, userId) {
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
      return userModel.batchGet(usernames)
        .then(users => {
          let recipientIds = users.map(user => user.id);
          let pendingUsers = usernames.filter(email => !users.find(u => u.username === email));

          return registerPendingUsers(pendingUsers)
            .then(pendingIds => _.concat(pendingIds, recipientIds));
        })
        .then(recipientIds => {
          let sharedWith = element.shared_with || [];
          sharedWith = _.concat(sharedWith, recipientIds);
          sharedWith = _.uniq(sharedWith);

          // updating element's shared_with field
          return elementModel.update(elementId, { shared_with: sharedWith })
            .then(() => notifySharedElement(element, userId, recipientIds))
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
