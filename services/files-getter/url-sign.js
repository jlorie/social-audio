import moment from 'moment';
import cfSigner from 'aws-cloudfront-sign';

const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/files-getter' : __dirname);

const KEY_PAIR_ID = process.env.KEY_PAIR_ID;
const PRIVATE_KEY_PATH = DIRNAME + '/pk/cf-pk.pem';
const EXPIRE_TIME = 60;

export function sign(url) {
  let signingParams = {
    keypairId: KEY_PAIR_ID,
    // privateKeyString: privateKey,
    privateKeyPath: PRIVATE_KEY_PATH,
    expireTime: moment().add(EXPIRE_TIME, 'seconds').utc().valueOf()
  };

  let signedUrl = cfSigner.getSignedUrl(url, signingParams);
  return Promise.resolve(signedUrl);
}
