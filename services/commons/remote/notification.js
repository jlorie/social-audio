const AWS = require('aws-sdk');

// Setting up AWS
const sns = new AWS.SNS();

class Notification {
  constructor(topic, region = 'us-east-1') {
    AWS.config.update({ region });
    this.topic = topic;
  }

  notify(message) {
    const notificationInfo = {
      Message: message,
      TopicArn: this.topic
    };

    let result = (resolve, reject) => {
      sns.publish(notificationInfo, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    };

    return new Promise(result);
  }

  push(message) {
    const notificationInfo = {
      Message: message,
      TargetArn: this.topic
    };

    let result = (resolve, reject) => {
      sns.publish(notificationInfo, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    };

    return new Promise(result);
  }

}

module.exports = Notification;
