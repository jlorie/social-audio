import moment from 'moment';
import config from './config';
import processConfig from './process-remider';
import { CONFIG, SUCCESS } from '../commons/constants';

const STAGE = process.env.SERVERLESS_STAGE;

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
  return config(CONFIG.ELEMENT_REMINDER)
    .then(configs => {
      let tasks = configs.map(conf => processConfig(conf));
      return Promise.all(tasks);
    })
    .then(() => SUCCESS);
}
