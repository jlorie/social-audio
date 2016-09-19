import { authenticate } from './authenticate';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  if (event.keepalive) {
    console.info('keepalive');
    return context.succeed('keepalive');
  }

  let input = event;
  input.stage = STAGE;
  console.info('Input: ', JSON.stringify(input, null, 2));

  return authenticate(input.username, input.password, input.timezone_offset)
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
