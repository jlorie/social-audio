import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';

const MAX_BATCH_ITEMS = 25;
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
  if (ids.length > MAX_BATCH_ITEMS) {
    throw new Error('DeleteLimitsExceeded');
  }

  console.info('Deleting ' + ids.length + ' elements for user ' + userId);
  return elementModel.batchGet(ids)
    .then(elements => {
      let ownerIds = [];
      let invitedIds = [];

      for (let element of elements) {
        if (element.owner_id === userId) {
          ownerIds.push(element.id);
        } else {
          let id = {
            user_id: userId,
            created_at: `${element.created_at}|visitor`
          };

          invitedIds.push(id);
        }
      }

      let tasks = [deleteOwnElements(ownerIds), deleteInvitedElements(invitedIds)];
      return Promise.all(tasks)
        .then(() => ({ message: 'OK' }));
    });
}

function deleteOwnElements(ids) {
  let noElements = ids.length === 0;
  if (noElements) {
    return null;
  }

  console.info('Deleting ' + ids.length + ' own elements');
  return elementModel.batchRemove(ids);
}

function deleteInvitedElements(ids) {
  let noElements = ids.length === 0;
  if (noElements) {
    return null;
  }

  console.info('Deleting ' + ids.length + ' invited elements');
  return elementsByUserModel.batchRemove(ids);
}
