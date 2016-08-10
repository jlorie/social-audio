import ElementModel from '../commons/resources/element-model';
import { ERR_ELEMENTS, ERR_SECURITY, SUCCESS } from '../commons/constants';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const elementModel = new ElementModel(URI_ELEMENTS);

export function updateAudioPrivacies({ elementId, audioId, isPublic, userId }) {
  console.info(`Updating privacy for audio ${audioId} in element ${elementId}`);

  // get element data
  return elementModel.getById(elementId)
    .then(element => {
      if (!element) {
        throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
      }

      element.audios = element.audios || [];
      let index = element.audios.findIndex(audio => audio.id === audioId);

      let isValid = index >= 0;
      if (!isValid) {
        throw new Error(ERR_ELEMENTS.INVALID_AUDIO);
      }
      let audio = element.audios[index];
      // check permission
      let hasPermissions = audio.user_id === userId;
      if (!hasPermissions) {
        throw new Error(ERR_SECURITY.ACCESS_DENIED);
      }

      audio.public = isPublic;

      // update element
      let updateData = {
        audios: element.audios
      };

      return elementModel.update(elementId, updateData)
        .then(() => SUCCESS);
    });
}
