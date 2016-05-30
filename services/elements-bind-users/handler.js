import { bindElement } from './bind-elements';
import { extractObjectFromSNSMessage } from '../commons/helpers/utils';
export default (event, context) => {
  let input = extractObjectFromSNSMessage(event);
  console.info('=> Input: ', JSON.stringify(input, null, 2));

  return bindElement(input)
    .then(result => {
      console.error('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      console.error('==> An error occurred. ', err.stack);

      let error = {
        status: 'ERROR',
        message: err.message
      };
      context.fail(JSON.stringify(error));
    });
};
