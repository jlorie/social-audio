'use strict';

const AWS = require('aws-sdk');
const config = require('../config');

AWS.config.update({region: config.AWS_REGION});
const sqs = new AWS.SQS();
const DEFAULT_WAIT_TIME = 10; // 10 seconds
const DEFAULT_VISIBILITY_TIME = 5 * 60; // 5 minutes

class Queue {
  constructor (url) {
    this.url = url;
  }

  poll(callback) {
    console.info('Polling queue ...');

    sqs.receiveMessage({
      QueueUrl: this.url,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: DEFAULT_WAIT_TIME,
      VisibilityTimeout: DEFAULT_VISIBILITY_TIME

    }, (err, data) => {
      if (err) {
        console.error('An error has occurred while polling tasks queue, ', err);
        return callback(err);
      }

      let message;
      if (data.Messages && data.Messages.length !== 0) {
        message = data.Messages[0];

      }

      callback(null, message);
    });
  }

  deleteMessage(messageID, callback) {
    console.info('Deleting message with ReceiptHandle: ', messageID);

    let params = {
      QueueUrl: this.url,
      ReceiptHandle: messageID
    };

    sqs.deleteMessage(params, (err) => {
      if (err) {
        console.error('An error has occurred while deleting message with id: ' +
          messageID + ', ' + err);

        return callback(err);
      }

      callback(null, 'success');
    });
  }
}

module.exports = Queue;
