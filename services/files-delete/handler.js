import { extractObjectFromSNSMessage } from '../commons/helpers/utils';
import { removeFilesFor } from './remove-files';

export default (event, context) => {
  const input = extractObjectFromSNSMessage(event);
  console.info('==> Input: ', JSON.stringify(input));

  return removeFilesFor(input)
    .then((result) => {
      console.info('==> Success: ', result);
      return context.succeed(result);
    })
    .catch(err => {
      console.error('==> An error occurred. ', err.stack);
      return context.fail(err);
    });
};
