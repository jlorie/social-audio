import { registerDevice } from './register-device';

export default (event, context) => {
  let input = event;
  console.info('==> Input: ', JSON.stringify(input, null, 2));
  let userId = input.identity_id.split(':').pop();

  try {
    return registerDevice(userId, input.device_token, input.platform)
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
