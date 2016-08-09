import { detailUser, detailMultipleUsers } from './detail-users';
import { detailProfile, updateProfile } from './detail-profile';
import { checkEmails } from './check-emails';
import { deleteUser } from './delete-user';

export default (event, context) => {
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  return handleRequest(event)
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
    case 'detail':
      {
        result = detailUser(input.user_id);
        break;
      }
    case 'delete':
      {
        result = deleteUser(userId);
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
    case 'update_profile':
      {
        result = updateProfile(userId, input.data);
        break;
      }
    case 'check_emails':
      {
        result = checkEmails(input.emails);
        break;
      }
    default:
      {
        result = Promise.reject('ActionNotSupported');
      }
  }

  return result;
}
