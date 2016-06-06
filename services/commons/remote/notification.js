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

  push(message, json = false) {
    const notificationInfo = {
      Message: message,
      TargetArn: this.topic
    };

    if (json) {
      notificationInfo.MessageStructure = 'json';
    }

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

  static createDeviceEndpoint(userId, deviceToken, platformId, region = 'us-east-1') {
    AWS.config.update({ region });
    this.sns = new AWS.SNS();

    let promise = (resolve, reject) => {
      if (!platformId) {
        return reject(new Error('PlatformInvalid'));
      }

      let params = {
        PlatformApplicationArn: platformId,
        Token: deviceToken,
        CustomUserData: userId
      };

      this.sns.createPlatformEndpoint(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data.EndpointArn);
      });
    };

    return new Promise(promise);
  }

}

module.exports = Notification;
