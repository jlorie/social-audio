import FunctionInvoker from '../commons/remote/function-invoker';

const RESOLUTIONS = [480, 1080];
const S3_URL_PREFIX = 'https://s3.amazonaws.com';
const URI_IMAGES_RESIZE = process.env.URI_IMAGES_RESIZE;
const BUCKET_ELEMENT_FILES = process.env.BUCKET_ELEMENT_FILES;
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;

const invoker = new FunctionInvoker(URI_IMAGES_RESIZE, SERVERLESS_STAGE);

export function optimizeImage(sourceUrl, originalMd5) {
  console.info('Optimizing image from ' + sourceUrl);

  return Promise.all(RESOLUTIONS.map(resolution => resizeImage(sourceUrl, originalMd5, resolution)))
    .then(results => ({
      thumbnailUrl: results[0],
      sourceUrl: results[1]
    }));
}

function resizeImage(sourceUrl, originalMd5, resolution) {
  const dest = `${S3_URL_PREFIX}/${BUCKET_ELEMENT_FILES}/images/${resolution}p-${originalMd5}.jpg`;
  let body = JSON.stringify({
    sourceUrl,
    destUrl: dest,
    resolution
  });

  return invoker.invoke({ body })
    .then((data) => {
      let invokeResult = JSON.parse(data.Payload);
      if (invokeResult.errorMessage) {
        throw new Error(invokeResult.errorMessage.message);
      }

      return dest;
    });
}
