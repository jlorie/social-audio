import ElementUserModel from '../commons/resources/element-user-model';
import ElementModel from '../commons/resources/element-model';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const URI_ELEMENTS = process.env.URI_ELEMENTS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);
const elementModel = new ElementModel(URI_ELEMENTS);

export function detailElement(id, userId) {
  console.info('Getting details for element with id ' + id);

  // check permissions
  return elementsByUserModel.getById(id, userId)
    .then(results => {
      let isEmpty = results.length === 0;
      if (isEmpty) {
        throw new Error('InvalidElement');
      }

      // get element
      return elementModel.getById(id);
    })
    .then(element => {
      // filter audios
      let isElementOwner = element.owner_id === userId;
      if (isElementOwner) {
        return element;
      }

      // show only public audios
      let restrictedAudios = [];
      for (let audio of element.audios) {
        if (audio.public === true || audio.user_id === userId) {
          restrictedAudios.push(audio);
        }
      }

      element.audios = restrictedAudios;
      return element;
    });
}
