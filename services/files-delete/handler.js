import { extractObjectFromSNSMessage } from '../commons/helpers/utils';
import { removeFilesFor } from './remove-files';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  const input = extractObjectFromSNSMessage(event);
  input.stage = STAGE;
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
