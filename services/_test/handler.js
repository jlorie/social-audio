import GeneralConfig from '../commons/resources/general-config';
import Storage from '../commons/remote/storage';

const config = new GeneralConfig();
export default (event, context) => {
  // https://s3.amazonaws.com/dev-bbluue-files/images/720p-8b423c118f2c800eeeb4b0676759f613.jpg
  let bucket = 'dev-bbluue-files';
  let key = 'images/720p-8b423c118f2c800eeeb4b0676759f613.jpg';
  return Storage.fileInfo(bucket, key);
};
