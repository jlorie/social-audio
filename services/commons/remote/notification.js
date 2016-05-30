const AWS = require('aws-sdk');

class Notification {
  constructor(topic, region = 'us-east-1') {
    AWS.config.update({ region });

    this.topic = topic;
    this.sns = new AWS.SNS();
  }

  notify(message) {
    const notificationInfo = {
      Message: message,
      TopicArn: this.topic
    };

    let result = (resolve, reject) => {
      this.sns.publish(notificationInfo, (err, data) => {
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
      this.sns.publish(notificationInfo, (err, data) => {
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
