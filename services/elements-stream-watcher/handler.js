import { processEvent } from './process-event';

export default (event, context) => {
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  Promise.all(event.Records.map(processEvent))
    .then(result => {
      console.error('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      console.error('==> An error occurred. ', err.stack);

      let error = {
        status: 'ERROR',
        message: err.message
      };
      context.fail(JSON.stringify(error));
    });
};
