import { shareElement } from './share';

export default (event, context) => {
  let { element_id, usernames, identity_id } = event;
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  let ownerId = identity_id.split(':').pop();
  return shareElement(element_id, usernames, ownerId)
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
