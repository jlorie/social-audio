import ElementModel from '../commons/resources/element-model';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const elementModel = new ElementModel(URI_ELEMENTS);

export function deleteElement(id, userId) {
  console.info('Deleting element with id ' + id);

  return elementModel.getById(id)
    .then(element => {
      if (element.owner_id !== userId) {
        throw new Error('AccessDenied');
      }

      return elementModel.remove(id);
    });
}

export function deleteMultipleElements(ids, userId) {

}
