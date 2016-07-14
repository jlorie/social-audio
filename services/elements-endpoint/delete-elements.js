import _ from 'lodash';
import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';
import { cleanElementsNotifications } from './clean-notifications';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementModel = new ElementModel(URI_ELEMENTS);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function deleteElement(id, userId) {
  console.info('Deleting element with id ' + id);

  return elementModel.getById(id)
    .then(element => {
      if (element.owner_id !== userId) {
        throw new Error('AccessDenied');
      }

      return elementModel.remove(id)
        .then(() => ({ message: 'OK' }));
    });
}

export function deleteMultipleElements(ids, userId) {
  console.info('Deleting ' + ids.length + ' elements for user ' + userId);
  return elementModel.batchGet(ids)
    .then(elements => {
      let ownerIds = [];
      let invitedIds = [];

      for (let element of elements) {
        if (element.owner_id === userId) {
          ownerIds.push(element.id);
        } else {
          invitedIds.push(element.id);
        }
      }

      let tasks = [deleteOwnElements(ownerIds, userId), deleteInvitedElements(invitedIds, userId)];
      return Promise.all(tasks)
        .then(() => ({ message: 'OK' }));
    });
}

function deleteOwnElements(ids, userId) {
  let noElements = ids.length === 0;
  if (noElements) {
    return null;
  }

  console.info('Deleting ' + ids.length + ' own elements');
  return elementModel.batchRemove(ids)
    .then(() => cleanElementsNotifications(ids, userId, true));
}

function deleteInvitedElements(ids, userId) {
  let noElements = ids.length === 0;
  if (noElements) {
    return null;
  }

  console.info('Deleting ' + ids.length + ' invited elements');
  return Promise.all(ids.map(elementId => elementsByUserModel.getById(elementId, userId)))
    .then(references => {
      let flatten = _.flattenDeep(references);
      let keys = flatten.map(ref => ({ user_id: ref.user_id, created_at: ref.created_at }));
      return elementsByUserModel.batchRemove(keys);
    })
    .then(() => cleanElementsNotifications(ids, userId, false));
}
