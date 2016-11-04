import { registerDevice } from './register-device';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  let input = event;
  input.stage = STAGE;
  console.info('==> Input: ', JSON.stringify(input, null, 2));
  let userId = input.identity_id.split(':').pop();

  try {
    return registerDevice(userId, input.device_data)
      .then(result => {
        console.info('==> Success: ', JSON.stringify(result, null, 2));
        context.succeed(result);
      })
      .catch(err => {
        console.info('==> An error occurred. ', err.stack);
        throw err;
      });
  } catch (err) {
    let error = {
      status: 'ERROR',
      message: err.message
    };
    context.fail(JSON.stringify(error));
  }
};
