import { notify } from './push-notification';
import { log } from './log-notification';
import { resolveMessage } from './message';
import { resolvePendingNotifications } from './pending-notification';

export default (event, context) => {
  console.info('==> Input: ', JSON.stringify(event, null, 2));

  let { emitterId, type, elementId, details, recipientIds } = event;

  return log({ emitterId, type, elementId, details, recipientIds })
    .then(() => resolveMessage({ emitterId, type }))
    .then(message => {
      // get pending notifications map
      return resolvePendingNotifications(recipientIds)
        .then(pendingMap => notify({ recipientIds, message, pendingMap }));
    })
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
