import { register } from './register-subscriber';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  const input = event;
  inut.stage = STAGE;
  console.info('=> Input: ', JSON.stringify(input, null, 2));

  return register(input.email, input.text)
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      let error = {
        status: 'ERROR',
        message: err.message
      };

      context.fail(JSON.stringify(error));
    });
};
