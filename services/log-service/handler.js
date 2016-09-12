import { processEvent } from './log';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  let input = event;
  input.stage = STAGE;
  console.info('==> Input LOG: ', JSON.stringify(input));
  Promise.all(event.Records.map(processEvent))
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    }).catch(err => {
      console.info('==> An error occurred. ', err.stack);

      let error = {
        status: 'ERROR',
        message: err.message
      };
      context.fail(JSON.stringify(error));
    });
};
