import { notify } from './notification';
import { log } from './log-notification';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  event.stage = STAGE;
  console.info('==> Input: ', JSON.stringify(event, null, 2));

  let { emitterId, type, elementId, details, recipientIds } = event;

  return log({ emitterId, type, elementId, details, recipientIds }) // logging
    .then(() => notify({ emitterId, type, elementId, recipientIds })) // notifying
    // results
    .then((result) => {
      console.info('==> Success: ', result);
      return context.succeed(result);
    })
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);
      return context.fail(err);
    });
};
