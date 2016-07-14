import ElementModel from '../commons/resources/element-model';
import { ERR_SECURITY, ERR_ELEMENTS } from '../commons/constants';
import { cleanAudioNotifications } from './clean-notifications';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const elementModel = new ElementModel(URI_ELEMENTS);

export function detachAudio(elementId, attachmentId, userId) {
  console.info('Detaching audio ' + attachmentId + ' for element ' + elementId);

  return elementModel.getById(elementId)
    .then(element => {
      // get audio
      let audios = element.audios || [];
      let audio = audios.find(audio => audio.id === attachmentId);

      if (!audio) {
        throw new Error(ERR_ELEMENTS.INVALID_ATTACHMENT);
      }
      // check permissions
      if (element.owner_id !== userId && audio.user_id !== userId) {
        throw new Error(ERR_SECURITY.ACCESS_DENIED);
      }

      return elementModel.detachFile({ element, attachmentId })
        .then(() => cleanAudioNotifications(elementId, attachmentId))
        .then(() => ({ status: 'OK' }));
    });
}
