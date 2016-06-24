import fs from 'fs';
import moment from 'moment';

import cfSigner from 'aws-cloudfront-sign';

const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT : __dirname);
const keyPairId = 'APKAIKCDQ3OSQD7QYOKA';
const cfUrl = 'https://cdn.bbluue.com/image/720p-56e73e576c8698fa383e1dd3.jpg';

export default (event, context) => {
  return resolvePrivateKey()
    .then(sign);
};

function sign(privateKey) {
  let signingParams = {
    keypairId: keyPairId,
    // privateKeyString: privateKey,
    privateKeyPath: DIRNAME + '/pk.pem',
    expireTime: moment().add(60, 'seconds').utc().valueOf()
  };

  let signedUrl = cfSigner.getSignedUrl(cfUrl, signingParams);

  return Promise.resolve(signedUrl);
}
