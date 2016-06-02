import _ from 'lodash';
import ElementUserModel from '../commons/resources/element-user-model';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function bind(element) {
  console.info('Indexing new element with id ' + element.id + ' for user ' + element.owner_id);
  let binding = {
    id: element.id,
    user_id: element.owner_id,
    created_at: element.created_at + '|owner',
    audios: 0,
    favorite: false
  };

  return elementsByUserModel.create(binding);
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
    return elementsByUserModel.update(oldData.id, updateData);
  }

  return 'NoUpdate';
}

export function remove(elementId) {
  // notify element deleted

  return elementsByUserModel.getById(elementId)
    .then(elements => {
      let noRelationships = elements.length === 0;
      if (noRelationships) {
        return 'NoRelationships';
      }

      console.info('Deleting ' + elements.length + ' relationships for ' + elementId);

      let keys = elements.map(item => {
        let key = {
          user_id: item.user_id,
          created_at: item.created_at
        };

        return key;
      });
      return elementsByUserModel.batchRemove(keys);
    });
}
