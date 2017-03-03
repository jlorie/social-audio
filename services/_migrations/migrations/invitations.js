import _ from 'lodash';
import AWS from 'aws-sdk';

import ResourceModel from '../../commons/resources/resource-model';

const region = process.env.SERVERLESS_REGION;
const project = process.env.SERVERLESS_PROJECT;
const functionName = 'users-invite';

const cloudwatchLogs = new AWS.CloudWatchLogs({ region });
const logGroupName = `/aws/lambda/${project}-${functionName}`;

export default () => {
  console.info('Migrating invitations ...');
  return resolveLogStreams()
    .then(logStreams => {
      let tasks = logStreams.map(s => resolveLogs(s.logStreamName));

      return Promise.all(tasks)
        .then(logEvents => {
          let tasks = logEvents.map(e => processEvents(e));

          return Promise.all(tasks);
        })
        .then(results => {
          let set = new Set();
          let invitations = [];

          // merge maps
          for (let map of results) {
            for (let [email, created_at] of map) {
              if (!set.has(email)) {
                set.add(email);
                invitations.push({ email, created_at });
              }
            }
          }

          return saveInvitations(invitations);
        })
        .then(() => '[Success]');
    });
};

function resolveLogStreams() {
  console.info('Resolving Log Streams ...');
  let promise = (resolve, reject) => {
    cloudwatchLogs.describeLogStreams({ logGroupName, limit: 1 }, onLogStreams);

    let logStreams = [];

    function onLogStreams(err, data) {
      if (err) {
        return reject(err);
      }

      logStreams = _.concat(logStreams, data.logStreams);
      let nextToken = data.nextToken;
      if (nextToken) {
        // keep searching while nextToken is available
        cloudwatchLogs.describeLogStreams({ logGroupName, nextToken }, onLogStreams);
      } else {
        return resolve(logStreams);
      }
    }
  };

  return new Promise(promise);
}

function resolveLogs(logStreamName) {
  console.info(`Resolving Logs from ${logStreamName}`);
  let promise = (resolve, reject) => {
    cloudwatchLogs.getLogEvents({ logGroupName, logStreamName }, onLogEvents);

    let logEvents = [];

    function onLogEvents(err, data) {
      if (err) {
        return reject(err);
      }

      logEvents = _.concat(logEvents, data.events);
      let nextToken = (data.events.length > 0 ? data.nextBackwardToken : null);
      if (nextToken) {
        // keep searching while nextToken is available
        cloudwatchLogs.getLogEvents({ logGroupName, logStreamName, nextToken }, onLogEvents);
      } else {
        return resolve(logEvents);
      }
    }
  };

  return new Promise(promise);
}

function processEvents(events) {
  let emails = new Map();

  for (let event of events) {
    const prefix = 'Sending invitation mail to ';

    let start = event.message.indexOf(prefix);
    if (start < 0) {
      continue;
    }

    start += prefix.length;
    let end = event.message.indexOf('\n', start);

    if (end >= 0) {
      let email = event.message.substring(start, end);
      if (!emails.has(email)) {
        emails.set(email, new Date(event.timestamp).toISOString());
      }
    }
  }

  return emails;
}

function saveInvitations(invitations) {
  console.info(`Persisting ${invitations.length} invitations`);

  const invitationsModel = new ResourceModel(process.env.URI_INVITATIONS);
  return invitationsModel.batchCreate(invitations);
}
