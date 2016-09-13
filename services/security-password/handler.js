import { change } from './change-password';
import { reset } from './reset-password';
import { requestReset } from './request-reset-password';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  let input = event;
  input.stage = STAGE;
  console.info('=> Input: ', JSON.stringify(input, null, 2));
  return handleRequest(input)
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

function handleRequest(req) {
  let result;

  switch (req.action) {
    case 'change':
      {
        const userId = req.identity_id.split(':').pop();
        result = change(userId, req.oldPassword, req.newPassword);
        break;
      }
    case 'reset':
      {
        let { email, password, token } = req;
        result = reset({ email, password, token });
        break;
      }

    case 'request-reset':
      {
        let { email } = req;
        result = requestReset({ email });
        break;
      }

    default:
      {
        result = Promise.resolve('InvalidAction');
      }
  }

  return result;
}
