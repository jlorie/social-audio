import { processEvent } from './process-event';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  event.stage = STAGE;
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  Promise.all(event.Records.map(processEvent))
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
