const URL_AWS_S3 = 'https://s3.amazonaws.com';

export function extractArgsFromUrl(url) {
  let args = url.split('/');

  return {
    bucket: args[3],
    key: args.slice(4).join('/')
  };
}

export function generateUrlFromArgs(bucket, key) {
  return [URL_AWS_S3, bucket, key].join('/');
}


export function extractObjectFromSNSMessage(snsMessage) {
  let msgString = JSON.stringify(snsMessage.Records[0].Sns.Message);

  let w = msgString.replace(/\\n/g, '');
  let x = w.replace(/\\/g, '');
  let y = x.substring(1, x.length - 1);
  let z = JSON.parse(y);

  return z;
}

export function extractObjectFromSQSMessage(sqsMessage) {
  let msgString = JSON.parse(sqsMessage.Body).Message;
  let obj = JSON.parse(msgString);
  return obj;
}


export function extractObjectFromS3Message(s3Message) {
  let object;
  if (typeof s3Message === 'object') {
    object = s3Message;
  } else {
    object = JSON.parse(s3Message);
  }

  return {
    bucket: object.Records[0].s3.bucket.name,
    key: object.Records[0].s3.object.key
  };
}
