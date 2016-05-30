import ElementModel from '../commons/resources/element-model';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const elementModel = new ElementModel(URI_ELEMENTS);

export function updateElement(id, updateData) {
  console.info('Updating element with id ' + id);

  return elementModel.update(id, updateData);
}
