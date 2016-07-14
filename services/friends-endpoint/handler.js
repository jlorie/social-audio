import { listFriends } from './list-friends';

export default (event, context) => {
  let input = event;
  console.info('=> Input: ', JSON.stringify(input, null, 2));

  return handleRequest(input)
    .then(result => {
      context.succeed(result);
      return result;
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

function handleRequest(req) {
  let result;
  let userId = req.identity_id.split(':').pop();

  try {
    switch (req.action) {
      case 'list':
        {
          result = listFriends(userId);
          break;
        }

      default:
        {
          throw new Error('ActionNotSupported');
        }
    }
  } catch (err) {
    return Promise.reject(err);
  }

  return result;
}
