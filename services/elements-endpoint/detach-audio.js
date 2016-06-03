import ElementModel from '../commons/resources/element-model';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const elementModel = new ElementModel(URI_ELEMENTS);

export function detachAudio(elementId, attachmentId, userId) {
  console.info('Detaching audio ' + attachmentId + ' for element ' + elementId);

  return elementModel.getById(elementId)
    .then(element => {
      // check permissions
      if (element.owner_id !== userId) {
        throw new Error('AccessDenied');
      }

      return elementModel.detachFile({ element, attachmentId })
        .then(() => ({ status: 'OK' }));
    });
}
