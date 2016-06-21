import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';

import { ERR_ELEMENTS } from '../commons/constants';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementModel = new ElementModel(URI_ELEMENTS);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function detailElement(id, userId) {
  console.info('Getting details for element with id ' + id);

  // get element
  return elementModel.getById(id)
    .then(element => {
      if (!element) {
        throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
      }

      // check permissions
      return checkPermissions(element, userId)
        .then(hasPermissions => {
          if (!hasPermissions) {
            throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
          }

          let isElementOwner = element.owner_id === userId;

          // formating output
          element.owner = isElementOwner;
          delete element.owner_id;

          if (isElementOwner) {
            return element;
          }

          // filter audios
          // show only public audios
          let restrictedAudios = [];
          for (let audio of element.audios || []) {
            if (audio.public === true || audio.user_id === userId) {
              restrictedAudios.push(audio);
            }
          }

          element.audios = restrictedAudios;
          return element;
        });
    });
}

function checkPermissions(element, userId) {
  if (element.owner_id === userId) {
    return Promise.resolve(true);
  }

  return elementsByUserModel.hasPermissions(element.id, userId);
}
