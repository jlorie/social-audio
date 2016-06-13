import { extractObjectFromSNSMessage } from '../commons/helpers/utils';
import { requestActivation } from './request-activation';
import { validate } from './validate-request';

const ACTION_VALIDATE = 'validate';
const ACTION_REQUEST = 'request';

export default (event, context) => {
  let input = getInput(event);
  console.info('Input: ', JSON.stringify(input, null, 2));

  // determining which function call
  let func = requestActivation;
  if (event.action === ACTION_VALIDATE) {
    func = validate;
  }

  func(input)
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

function getInput(event) {
  let input = {
    action: event.action,
    email: event.email
  };

  if (event.token) {
    input.token = event.token;
  }

  if (event.Records) {
    let data = extractObjectFromSNSMessage(event);

    input.action = ACTION_REQUEST;
    input.email = data.username;
  }

  return input;
}
