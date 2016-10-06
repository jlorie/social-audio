import _ from 'lodash';
import ElementUserModel from '../commons/resources/element-user-model';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);
export function listElements(userId) {
  console.info('Querying elements for user with id ' + userId);

  return elementsByUserModel.list(userId)
    .then(formatResults);
}

function formatResults(elements) {
  let result = {
    items: [],
    next: elements.next
  };

  for (let item of elements) {
    let [date, ...tail] = item.created_at.split('|');
    let isOwner = tail.pop() === 'owner';

    result.items.push({
      id: item.id,
      created_at: date,
      owner: isOwner,
      audios: tmpAudioFlag(item.audios),
      thumbnail_url: item.thumbnail_url,
      favorite: item.favorite
    });
  }

  return result;
}


function tmpAudioFlag(audios) {
  if (!audios) {
    return 0;
  }

  if (_.isNumber(audios)) {
    return audios;
  }

  return _.reduce(audios, (result, value) => result + value);
}
