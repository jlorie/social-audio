import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);
export function listElements(userId) {
  console.info('Querying elements for user with id ' + userId);

  let filters = {
    ref_status: REF_STATUS.RESOLVED
  };

  return elementsByUserModel.get({ userId, filters })
    .then(formatResults);
}

function formatResults(elements) {
  let result = {
    items: [],
    next: elements.next
  };

  for (let item of elements.items) {
    let created = item.created_at.split('|');

    result.items.push({
      id: item.id,
      created_at: created[0],
      owner: created[1] === 'owner',
      audios: item.audios,
      thumbnail_url: item.thumbnail_url,
      favorite: item.favorite
    });
  }

  return result;
}
