import { change } from './change-password';

export default (event, context) => {
  let input = event;
  console.info('=> Input: ', JSON.stringify(input, null, 2));
  const userId = input.identity_id.split(':').pop();

  return change(userId, input.oldPassword, input.newPassword)
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

}
