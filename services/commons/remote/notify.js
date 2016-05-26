import AWS from 'aws-sdk';

// Setting up AWS
AWS.config.update({ region: process.env.SERVERLESS_REGION });
const sns = new AWS.SNS();

export function notify(message, topic) {
  let result = (resolve, reject) => {
    const notificationInfo = {
      Message: message,
      TopicArn: topic
    };

    console.info('Notfying topic with arn', topic);
    sns.publish(notificationInfo, (err) => {
      if (err) {
        return reject(err);
      }

      resolve('success');
    });
  };

  return new Promise(result);
}
