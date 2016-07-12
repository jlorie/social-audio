import { processEvent } from './process-event';

export default (event, context) => {
  if (event.keepalive) {
    console.info('keepalive');
    return context.succeed('keepalive');
  }

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
      context.succeed(JSON.stringify(error));
    });
};
