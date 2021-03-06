import { list } from './list-notifications';
import { remove } from './remove-notifications';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  const input = event;
  input.stage = STAGE;
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
        let types = (input.types ? input.types.split(',') : undefined);
        result = list(userId, types);
        break;
      }
    case 'delete':
      {
        result = remove(input.notification_id, userId);
        break;
      }
    default:
      {
        result = Promise.resolve({ message: 'ActionNotSupported' });
      }
  }

  return result;
}
