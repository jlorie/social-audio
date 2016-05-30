import ResourceModel from '../commons/resources/resource-model';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUserModel = new ResourceModel(URI_ELEMENTS_BY_USERS);

export function bindElement(element) {
  console.info('Indexing element with id ' + element.id + ' for user ' + element.owner_id);
  let binding = {
    id: element.id,
    user_id: element.owner_id,
    created_at: element.created_at + '|owner',
    audios: 0,
    favorite: false
  };

  return elementsByUserModel.create(binding);
}
