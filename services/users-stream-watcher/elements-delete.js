import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementModel = new ElementModel(URI_ELEMENTS);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function deleteElementsFor(userId) {
  console.info('Deleting elements owned by ' + userId);

  return resolveOwnedElements(userId)
    .then(elementIds => elementModel.batchRemove(elementIds));
}

function resolveOwnedElements(userId) {
  return elementsByUserModel.get({ userId })
    .then(elements => elements.items.filter(e => e.created_at.endsWith('owner')))
    .then(elements => elements.map(e => e.id));
}
