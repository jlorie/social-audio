import { shareElement, shareMultipleElements } from './share';

export default (event, context) => {
  let { element_id, element_ids, usernames, identity_id } = event;
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  let sharePromise;
  let ownerId = identity_id.split(':').pop();

  if (element_ids) {
    sharePromise = shareMultipleElements(element_ids, usernames, ownerId);
  } else {
    sharePromise = shareElement(element_id, usernames, ownerId);
  }

  return sharePromise
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
