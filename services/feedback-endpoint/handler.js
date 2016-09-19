import { register } from './register-feedback';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  const input = event;
  input.stage = STAGE;
  console.info('=> Input: ', JSON.stringify(input, null, 2));

  const userId = input.identity_id.split(':').pop();
  return register(userId, input.text)
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
