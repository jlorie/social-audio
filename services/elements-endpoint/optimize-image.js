import FunctionInvoker from '../commons/remote/function-invoker';
import { generateUrlFromArgs } from '../commons/helpers/utils';

const RESOLUTIONS = [480, 1080];
const URI_IMAGES_RESIZE = process.env.URI_IMAGES_RESIZE;
const BUCKET_ELEMENT_FILES = process.env.BUCKET_ELEMENT_FILES;
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;

const invoker = new FunctionInvoker(URI_IMAGES_RESIZE, SERVERLESS_STAGE);

export default (sourceUrl, sourceId) => {
  console.info('Optimizing image from ' + sourceUrl);

  return Promise.all(RESOLUTIONS.map(res => resizeImage(sourceUrl, sourceId, res)))
    .then(results => ({
      thumbnailUrl: results[0],
      sourceUrl: results[1]
    }));
};

function resizeImage(sourceUrl, sourceId, resolution) {
  const path = `/images/${resolution}p-${sourceId}.jpg`;
  const destUrl = generateUrlFromArgs(BUCKET_ELEMENT_FILES, path);
  let body = JSON.stringify({
    sourceUrl,
    destUrl,
    resolution
  });

  return invoker.invoke({ body })
    .then((data) => {
      let invokeResult = JSON.parse(data.Payload);
      if (invokeResult.errorMessage) {
        throw new Error(invokeResult.errorMessage.message);
      }

      return destUrl;
    });
}
