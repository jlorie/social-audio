import _ from 'lodash';
import UserModel from '../commons/resources/user-model';
import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';

import { REF_STATUS } from '../commons/constants';

import { notifySharedElement } from './notify';
import { registerPendingUsers } from './pending-users';

const URI_USERS = process.env.URI_USERS;
const URI_ELEMENTS = process.env.URI_ELEMENTS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const userModel = new UserModel(URI_USERS);
const elementModel = new ElementModel(URI_ELEMENTS);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

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
          // create pending references
          return createElementReferences(element, recipientIds)
            .then(() => notifySharedElement(element, userId, recipientIds));
        })
        .then(() => ({ message: 'OK' }));
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


function createElementReferences(element, recipientIds) {
  let references = recipientIds.map(userId => {
    let reference = {
      id: element.id,
      user_id: userId,
      created_at: new Date().toISOString() + '|visitor',
      thumbnail_url: element.thumbnail_url,
      audios: element.audios.filter(a => a.public).length,
      favorite: false,
      ref_status: REF_STATUS.PENDING
    };

    return reference;
  });

  return elementsByUserModel.batchCreate(references);
}
