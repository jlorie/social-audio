import FunctionInvoker from '../commons/remote/function-invoker';

const S3_URL_PREFIX = 'https://s3.amazonaws.com';
const PROFILE_RESOLUTION = 300;
const URI_IMAGES_RESIZE = process.env.URI_IMAGES_RESIZE;
const BUCKET_ELEMENT_FILES = process.env.BUCKET_ELEMENT_FILES;

const invoker = new FunctionInvoker(URI_IMAGES_RESIZE);

export function optimizeImage(sourceUrl, userId) {
  const dest = `${S3_URL_PREFIX}/${BUCKET_ELEMENT_FILES}/images/profile-${userId}.jpg`;
  let body = JSON.stringify({
    sourceUrl,
    destUrl: dest,
    PROFILE_RESOLUTION
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
