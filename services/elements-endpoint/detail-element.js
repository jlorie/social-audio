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
      return resolveReference(element.id, userId)
        .then(reference => {
          let isElementOwner = element.owner_id === userId;
          let hasPermissions = isElementOwner || reference;
          if (!hasPermissions) {
            throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
          }

          // formating output
          element.favorite = reference.favorite;
          element.owner = isElementOwner;
          element.audios = formatAudioList(element.audios || []);

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

function resolveReference(elementId, userId) {
  return elementsByUserModel.getById(elementId, userId)
    .then(references => references[0]);
}

function formatAudioList(audios) {
  for (let audio of audios) {
    if (!audio.playbacks) {
      audio.playbacks = 0;
    }
  }

  return audios;
}
