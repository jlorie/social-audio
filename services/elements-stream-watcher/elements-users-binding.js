import _ from 'lodash';
import Storage from '../commons/remote/storage';
import ElementUserModel from '../commons/resources/element-user-model';
import ElementModel from '../commons/resources/element-model';
import { REF_STATUS, ERR_ELEMENTS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const URI_ELEMENTS = process.env.URI_ELEMENTS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);
const elementModel = new ElementModel(URI_ELEMENTS);

export function bind(element) {
  console.info('Indexing new element with id ' + element.id + ' for user ' + element.owner_id);
  let reference = {
    id: element.id,
    user_id: element.owner_id,
    created_at: element.created_at + '|owner',
    thumbnail_url: element.thumbnail_url,
    audios: 0,
    favorite: false,
    ref_status: REF_STATUS.RESOLVED
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
  newData.audios = newData.audios || [];
  oldData.audios = oldData.audios || [];
  if (oldData.audios.length !== newData.audios.length) {
    updateData.audios = newData.audios.length;
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
  // notify element deleted

  return elementsByUserModel.getById(elementId)
    .then(references => {
      let noRelationships = references.length === 0;
      if (noRelationships) {
        return 'NoRelationships';
      }

      return Promise.all(references.map(cleanAttachments))
        .then(() => {
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
    });
}

function cleanAttachments(reference) {
  let userId = reference.user_id;
  let elementId = reference.id;

  let isOwner = reference.created_at.endsWith('owner');
  if (isOwner) {
    return Promise.resolve('NothingToDo');
  }

  console.info('Cleaning audios records for ' + userId + ' in element ' + elementId);
  return elementModel.getById(elementId)
    .then(element => {
      if (!element) {
        throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
      }

      let isEmpty = element.audios.length === 0;
      if (isEmpty) {
        return Promise.resolve('NothingToDo');
      }

      let expiredAudios = element.audios.map((audio, index) => {
        let audioUrl = audio.source_url;
        // delete record
        element.audios.splice(index, 1);
        return audioUrl;
      });

      return deleteAudioFiles(expiredAudios);
    });
}

function deleteAudioFiles(uris) {
  console.info('Deleting ' + uris.length + ' files');
  return Storage.batchRemoveFiles(uris);
}
