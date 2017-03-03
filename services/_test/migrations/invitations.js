import AWS from 'aws-sdk';

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
        .then(results => {
          let processTasks = results.map(r => processEvents(r.events));

          return Promise.all(processTasks);
        })
        .then(results => {
          // merge sets
          console.log('==> results: ', JSON.stringify(results));
          // return Array.from(emails);
          return results;
        });
    });
};

function resolveLogStreams() {
  console.info('Resolving Log Streams ...');
  let promise = (resolve, reject) => {
    cloudwatchLogs.describeLogStreams({ logGroupName, limit: 1 }, (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data.logStreams);
    });
  };

  return new Promise(promise);
}

function resolveLogs(logStreamName) {
  console.info(`Resolving Logs from ${logStreamName}`);
  let promise = (resolve, reject) => {
    return cloudwatchLogs.getLogEvents({ logGroupName, logStreamName }, (err, data) => {
      if (err) {
        return reject(err);
      }

      // console.info('==> data: ', JSON.stringify(data, null, 2));
      return resolve(data);
    });
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

    return emails;
  }

  return emails;
}
