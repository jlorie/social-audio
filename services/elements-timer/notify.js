import FunctionInvoker, { INVOKE_TYPE } from '../commons/remote/function-invoker';
import { EMPTY } from '../commons/constants';

const SYSTEM_EMITTER = 'system';
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;
const URI_NOTIFY_ENDPOINT = process.env.URI_NOTIFY_ENDPOINT;
const invoker = new FunctionInvoker(URI_NOTIFY_ENDPOINT, SERVERLESS_STAGE);

export default (user, ref, notificationType) => {
  if (!ref) {
    return Promise.resolve(EMPTY);
  }

  console.info(`Notifying ${notificationType} for ref ${ref.id}`);

  let notificationInfo = JSON.stringify({
    recipientIds: [user.id],
    type: notificationType,
    emitterId: SYSTEM_EMITTER,
    elementId: ref.id,
    details: {
      thumbnail_url: ref.thumbnail_url
    }
  });

  return invoker.invoke({ body: notificationInfo, type: INVOKE_TYPE.Event });
};
