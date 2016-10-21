import uuid from 'node-uuid';
import optimizeImage from './optimize-image';
import share from './share-element';
import ElementModel from '../commons/resources/element-model';

import { generateUrlFromArgs } from '../commons/helpers/utils';
import { ERR_ELEMENTS } from '../commons/constants';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const BUCKET_ELEMENT_UPLOAD = process.env.BUCKET_ELEMENT_UPLOAD;

const elementModel = new ElementModel(URI_ELEMENTS);

export default (userId, data) => {
  if (!data.path) {
    throw new Error(ERR_ELEMENTS.INVALID_PATH);
  }

  const elementId = uuid.v1();
  console.info(`Registering new element from ${data.path} with id ${elementId}`);

  const sourcePath = generateUrlFromArgs(BUCKET_ELEMENT_UPLOAD, data.path);
  return optimizeImage(sourcePath, elementId)
    .then(optimized => {
      // format record
      let element = {
        id: elementId,
        owner_id: userId,
        created_at: data.created_at,
        uploaded_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        location_info: data.location_info,
        type: 'image',
        source_url: optimized.sourceUrl,
        thumbnail_url: optimized.thumbnailUrl,
      };

      // insert
      return elementModel.create(element)
        .then(newElement => {
          return share(newElement.owner_id, newElement.id, data.shared_with)
            .then(() => format(newElement));
        });
    });
};

function format(data) {
  let result = {
    id: data.id,
    created_at: data.created_at,
    owner: true,
    thumbnail_url: data.thumbnail_url,
    favorite: false
  };

  return result;
}
