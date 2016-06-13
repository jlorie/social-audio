import { unsubscribe } from './unsubscribe';

export default (event, context) => {
  let input = event;
  console.info('Input: ', JSON.stringify(input, null, 2));

  unsubscribe(input)
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
