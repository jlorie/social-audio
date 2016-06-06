import { invite } from './invite';
export default (event, context) => {
  let { hostId, emails } = event;
  console.info('==> Input: ', JSON.stringify(event, null, 2));

  return invite(hostId, emails)
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
