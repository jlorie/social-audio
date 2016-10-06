import _ from 'lodash';
import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function bind(element) {
  console.info('Indexing new element with id ' + element.id + ' for user ' + element.owner_id);
  let reference = {
    id: element.id,
    user_id: element.owner_id,
    created_at: [element.created_at, element.uploaded_at, 'owner'].join('|'),
    thumbnail_url: element.thumbnail_url,
    favorite: false,
    ref_status: REF_STATUS.IDLE
  };

  return elementsByUserModel.create(reference);
}

export function update(oldData, newData) {
  console.info('Updating index for element ' + newData.id);

  let updateData = {};

  // check thumbnail
  if (newData.thumbnail_url && oldData.thumbnail_url !== newData.thumbnail_url) {
    updateData.thumbnail_url = newData.thumbnail_url;
  }

  // check audios
  if ((oldData.audios || []).length !== (newData.audios || []).length) {
    // count audios by users
    updateData.audios = countAudios(newData.audios);
  }

  // check favorite
  if (oldData.favorite !== newData.favorite) {
    updateData.favorite = newData.favorite;
  }

  let newDataToUpdate = _.values(updateData).length > 0;
  if (newDataToUpdate) {
    return elementsByUserModel.updateById(oldData.id, updateData);
  }

  return 'NoUpdate';
}

export function remove(elementId) {
  return elementsByUserModel.getById(elementId)
    .then(references => {
      let noRelationships = references.length === 0;
      if (noRelationships) {
        return Promise.resolve('NoRelationships');
      }

      let keys = references.map(item => {
        let key = {
          user_id: item.user_id,
          created_at: item.created_at
        };

        return key;
      });

      console.info('Deleting ' + references.length + ' relationships for ' + elementId);
      return elementsByUserModel.batchRemove(keys);
    });
}

function countAudios(audioList) {
  let audios = {};
  for (let audio of audioList || []) {
    audios[audio.user_id] = (audios[audio.user_id] || 0) + 1;
  }

  return audios;
}
