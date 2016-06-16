import ElementModel from '../commons/resources/element-model';
import { ERR_ELEMENTS } from '../commons/constants';

const URI_ELEMENTS = process.env.URI_ELEMENTS;

const elementModel = new ElementModel(URI_ELEMENTS);

export function detailElement(id, userId) {
  console.info('Getting details for element with id ' + id);

  // get element
  return elementModel.getById(id)
    .then(element => {
      if (!element) {
        throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
      }
      // check permissions
      let isElementOwner = element.owner_id === userId;
      let hasPermissions = isElementOwner || element.shared_with.indexOf(userId) > -1;
      if (!hasPermissions) {
        throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
      }

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
}
