import { detailUser, detailMultipleUsers } from './detail-users';
import { detailProfile } from './detail-profile';

export default (event, context) => {
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  try {
    return handleRequest(event)
      .then(result => {
        console.info('==> Success: ', JSON.stringify(result, null, 2));
        context.succeed(result);
      })
      .catch(err => {
        throw err;
      });
  } catch (err) {
    console.info('==> An error occurred. ', err.stack);

    let error = {
      status: 'ERROR',
      message: err.message
    };
    context.fail(JSON.stringify(error));
  }
};

function handleRequest(input) {
  let result;
  let userId = input.identity_id.split(':').pop();

  switch (input.action) {
    case 'detail':
      {
        result = detailUser(input.user_id);
        break;
      }
    case 'batch_detail':
      {
        result = detailMultipleUsers(input.user_ids);
        break;
      }
    case 'profile':
      {
        result = detailProfile(userId);
        break;
      }
    default:
      {
        throw new Error('ActionNotSupported');
      }
  }

  return result;
}
