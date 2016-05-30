import ElementModel from '../commons/resources/element-model';

const URI_ELEMENTS_RESOURCE = process.env.URI_ELEMENTS_RESOURCE;

const elementModel = new ElementModel(URI_ELEMENTS_RESOURCE);
export function listElements(userId) {
  console.info('Querying elements for user with id ' + userId);

  let attributes = 'id, created_at, thumbnail_url';
  return elementModel.get({ userId, attributes });
}
