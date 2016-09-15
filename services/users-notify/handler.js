import { notify } from './notification';
import { log } from './log-notification';

import { NOTIFICATION_TYPE } from '../commons/constants';

export default (event, context) => {
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
