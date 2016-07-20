import _ from 'lodash';
import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function filterByFriend(userId, friendId) {
  // TODO chequear permisos si friendId es realmente amigo de userId
  console.info('Filtering elements for friend with id ' + friendId);
  let filters = {
    ref_status: REF_STATUS.RESOLVED
  };

  return elementsByUserModel.get({ userId, filters })
    .then(references => {
      let filteredReferences = [];

      for (let reference of references.items) {
        let audioMap = reference.audios;
        if (!audioMap || _.isNumber(audioMap)) {
          audioMap = {};
        }

        for (let id in audioMap) {
          if (id === friendId) {
            filteredReferences.push(reference);
            break;
          }
        }
      }

      return formatResults(filteredReferences);
    });
}

function formatResults(elements) {
  let result = {
    items: [],
    next: elements.next
  };

  for (let item of elements) {
    let created = item.created_at.split('|');

    result.items.push({
      id: item.id,
      created_at: created[0],
      owner: created[1] === 'owner',
      audios: tmpAudioFlag(item.audios),
      thumbnail_url: item.thumbnail_url,
      favorite: item.favorite
    });
  }

  return result;
}

// FIXME audios field should reutrn boolean value
function tmpAudioFlag(audios) {
  if (!audios) {
    return 0;
  }

  if (_.isNumber(audios)) {
    return audios;
  }

  return 1;
}
