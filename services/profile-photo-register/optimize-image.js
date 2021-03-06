import uuid from 'node-uuid';
import FunctionInvoker from '../commons/remote/function-invoker';

const S3_URL_PREFIX = 'https://s3.amazonaws.com';
const PROFILE_RESOLUTION = 480;
const URI_IMAGES_RESIZE = process.env.URI_IMAGES_RESIZE;
const BUCKET_ELEMENT_FILES = process.env.BUCKET_ELEMENT_FILES;
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;

const invoker = new FunctionInvoker(URI_IMAGES_RESIZE, SERVERLESS_STAGE);

export function optimizeImage(sourceUrl) {
  const dest = `${S3_URL_PREFIX}/${BUCKET_ELEMENT_FILES}/images/profile-${uuid.v1()}.jpg`;
  let body = JSON.stringify({
    sourceUrl,
    destUrl: dest,
    resolution: PROFILE_RESOLUTION
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
