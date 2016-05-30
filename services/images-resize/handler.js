import { resizeImage } from './resize-image';
import { updateElement } from './element-update';
import { extractObjectFromSNSMessage } from '../commons/helpers/utils';

const RESOLUTIONS = [200, 720];

export default (event, context) => {
  let input = extractObjectFromSNSMessage(event);
  console.info('=> Input: ', JSON.stringify(input, null, 2));

  Promise.all(RESOLUTIONS.map(xp => {
      let params = {
        uri: input.source_url,
        resolution: xp,
        elementId: input.id
      };
      return resizeImage(params);
    }))
    .then(uris => {
      let [thumbnail_url, source_url] = uris;
      return updateElement(input.id, { thumbnail_url, source_url });
    })
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      console.error('==> An error occurred. ', err.stack);

      let error = {
        status: 'ERROR',
        message: err.message
      };
      context.fail(JSON.stringify(error));
    });
};
