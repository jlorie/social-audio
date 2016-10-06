import ElementModel from '../commons/resources/element-model';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const elementModel = new ElementModel(URI_ELEMENTS);

export default (elementIds) => {
  console.info('Checking elements ' + elementIds);
  return elementModel.batchGet(elementIds)
    .then(elements => ({ elements: elements.map(e => e.id) }));
};
