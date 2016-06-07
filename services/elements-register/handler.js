import { extractObjectFromS3Message } from '../commons/helpers/utils';
import { register } from './register';

export default (event, context) => {
  const input = extractObjectFromS3Message(event);
  console.info('==> Input: ', JSON.stringify(input));

  return register(input)
    .then((result) => {
      console.info('==> Success: ', result);
      return context.succeed(result);
    })
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);
      return context.fail(err);
    });
};
