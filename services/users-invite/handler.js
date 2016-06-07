import { invite } from './invite';
export default (event, context) => {
  let { identity_id, emails } = event;
  console.info('==> Input: ', JSON.stringify(event, null, 2));

  let hostId = identity_id.split(':').pop();
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
