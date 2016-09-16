import moment from 'moment';
import GeneralConfig from '../commons/resources/general-config';
import processConfig from './process-remider';

const config = new GeneralConfig(REGION, STAGE);

const STAGE = process.env.SERVERLESS_STAGE;
const REGION = process.env.SERVERLESS_REGION;

export default (event, context) => {
  console.info('==> Input: ', JSON.stringify({
    stage: STAGE,
    currentHour: moment.utc().hour()
  }));

  return resolveReminders()
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

function resolveReminders() {
  // get and process every reminder in general config table
  return getReminderConfig().then(configs => {
    let tasks = configs.map(conf => processConfig(conf.hour, conf.notification_type));
    return Promise.all(tasks);
  });
}

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
