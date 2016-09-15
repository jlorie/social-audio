import moment from 'moment';
import GeneralConfig from '../commons/resources/general-config';
import selectUsers from './select-users';
import getOldestPendingElements from './oldest-pending-element';
import notifyPendingElement from './notify';

const config = new GeneralConfig(REGION, STAGE);

const STAGE = process.env.SERVERLESS_STAGE;
const REGION = process.env.SERVERLESS_REGION;

export default (event, context) => {
  // get utc time
  const currentHour = moment.utc().hour();
  console.info('==> Input: ', JSON.stringify({
    stage: STAGE,
    currentHour
  }));

  // get reminders configurations
  return getReminderConfig()
    .then(configs => {
      // calculate timezone offset for user && get users for every offset
      return Promise.all(configs.map(reminderConfig => {
        let timezoneOffset = calculateOffset(reminderConfig.hour);
        return notifyUsers(timezoneOffset, reminderConfig.notification_type);
      }));
    })
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

  // return getOldestPendingElements('07484310-0a1a-48e0-b9c7-28257150f04a');
};

let cachedConfig = null;

function getReminderConfig() {
  if (cachedConfig) {
    return Promise.resolve(cachedConfig);
  }

  const ELEMENT_REMINDER_CONFIG = 'elements_reminder';
  return config.get(ELEMENT_REMINDER_CONFIG)
    .then(result => {
      cachedConfig = result;
      return result;
    });
}

function notifyUsers(timezoneOffset, notifType) {
  console.info('Notifying users with timezone offset: ' + timezoneOffset);

  return selectUsers(timezoneOffset)
    .then(users => Promise.all(users.map(user => {
      return getOldestPendingElements(user.id)
        .then(pending => ({ user, pending }));
    })))
    .then(results => {
      return Promise.all(results.map(r => notifyPendingElement(r.user, r.pending, notifType)));
    });
}

function calculateOffset(desiredHour) {
  const currentHour = moment.utc().hour();
  let result = -1;

  for (let offset = -11; offset <= 12; offset++) {
    if (desiredHour === currentHour + offset) {
      result = offset;
      break;
    }
  }

  return result;
}
