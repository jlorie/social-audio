import FunctionInvoker, { INVOKE_TYPE } from '../commons/remote/function-invoker';
import { EMPTY, NOTIFICATION_TYPE, ERR_NOTIFICATIONS } from '../commons/constants';

const SYSTEM_EMITTER = 'system';
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;
const URI_NOTIFY_ENDPOINT = process.env.URI_NOTIFY_ENDPOINT;
const invoker = new FunctionInvoker(URI_NOTIFY_ENDPOINT, SERVERLESS_STAGE);

export default (user, element, notificationType) => {
  if (!element) {
    return Promise.resolve(EMPTY);
  }

  if (notificationType !== NOTIFICATION_TYPE.PENDING_AUDIO &&
    notificationType !== NOTIFICATION_TYPE.ELEMENT_EXPIRED) {
    throw new Error(ERR_NOTIFICATIONS.INVALID_NOTIFICATION);
  }

  console.info(`Notifying pending element ${element.id} for user ${user.id}.`);

  let notificationInfo = JSON.stringify({
    recipientIds: [user.id],
    type: notificationType,
    emitterId: SYSTEM_EMITTER,
    elementId: element.id,
    details: {
      thumbnail_url: element.thumbnail_url
    }
  });

  return invoker.invoke({ body: notificationInfo, type: INVOKE_TYPE.Event });
};
