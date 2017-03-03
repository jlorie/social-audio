import _ from 'lodash';
import { queryUsers, queryDevices } from './query';

const ZeroDate = new Date('1970-01-01').toISOString();

export default (event, context) => {
  let input = event;
  input.stage = process.env.SERVERLESS_STAGE;
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  let { resource, from, to } = input;

  if (_.isEmpty(from)) {
    from = ZeroDate;
  }
  if (_.isEmpty(to)) {
    to = new Date().toISOString();
  }
  return query(resource, from, to)
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);
      let error = {
        status: 'ERROR',
        message: err.message
      };

      context.fail(JSON.stringify(error));
    });
};

function query(resource, from, to) {
  let result = null;
  switch (resource) {
    case 'user':
      {
        result = queryUsers(from, formatToDate(to));
        break;
      }
    case 'device':
      {
        result = queryDevices(from, formatToDate(to));
        break;
      }

    default:
      {
        result = Promise.reject(new Error('InvalidResource'));
      }
  }

  return result;
}

function formatToDate(date) {
  let time = new Date(date);

  let hasTime = time.getUTCHours() + time.getUTCMinutes() +
    time.getUTCSeconds() + time.getUTCMilliseconds() > 0;

  if (!hasTime) {
    // setting up time
    time.setUTCHours(23);
    time.setUTCMinutes(59);
    time.setUTCSeconds(59);
    time.setUTCMilliseconds(999);
  }

  return time.toISOString();
}
