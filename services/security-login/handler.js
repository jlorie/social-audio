import { authenticate } from './authenticate';

export default (event, context) => {
  if (event.keepalive) {
    console.info('keepalive');
    return context.succeed('keepalive');
  }

  let input = event;
  console.info('Input: ', JSON.stringify(input, null, 2));

  return authenticate(input.username, input.password)
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
