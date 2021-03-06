import { listFriends } from './list-friends';
import { addFriend } from './add-friend';
import { invite } from './invite';
import { checkEmails } from './check-emails';
import { deleteFriend } from './delete-friend';
import { activateFriend } from './activate-friend';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  let input = event;
  input.stage = STAGE;
  console.info('=> Input: ', JSON.stringify(input, null, 2));

  return handleRequest(input)
    .then(context.succeed)
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);
      let error = {
        status: 'ERROR',
        message: err.message
      };

      return context.fail(JSON.stringify(error));
    });
};

function handleRequest(req) {
  let result;
  let userId = (req.identity_id || '').split(':').pop();

  try {
    switch (req.action) {
      case 'list':
        {
          result = listFriends(userId);
          break;
        }
      case 'add':
        {
          result = addFriend(userId, req.friend_id);
          break;
        }
      case 'delete':
        {
          result = deleteFriend(userId, req.friend_id);
          break;
        }
      case 'invite':
        {
          result = invite(userId, req.emails);
          break;
        }
      case 'check_emails':
        {
          result = checkEmails(req.emails, userId);
          break;
        }
      case 'activate':
        {
          result = activateFriend(req.friend_id);
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
