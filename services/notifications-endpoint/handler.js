import { list } from './list-notifications';
import { remove } from './remove-notifications';

export default (event, context) => {
  const input = event;
  console.info('=> Input: ', JSON.stringify(input, null, 2));

  return handleRequest(input)
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

function handleRequest(input) {
  let result;
  let userId = input.identity_id.split(':').pop();

  switch (input.action) {
    case 'list':
      {
        result = list(userId);
        break;
      }
    case 'delete':
      {
        result = remove(input.notification_id, userId);
        break;
      }
    default:
      {
        result = Promise.resolve('ActionNotSupported');
      }
  }

  return result;
}
