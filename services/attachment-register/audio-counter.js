import ElementModel from '../commons/resources/element-model';

const URI_ELEMENTS_RESOURCE = process.env.URI_ELEMENTS_RESOURCE;
const elementModel = new ElementModel(URI_ELEMENTS_RESOURCE);

export function updateAudioCount(elementId, requesterId) {
  return elementModel.getById(elementId)
    .then(element => {
      // count audio for requesterId
      let counter = 0;
      for (let audio of element.audios || []) {
        if (audio.user_id === requesterId) {
          counter++;
        }
      }
    });
}
