import FunctionInvoker, { INVOKE_TYPE } from '../commons/remote/function-invoker';

const SYSTEM_EMITTER = 'system';
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;
const URI_NOTIFY_ENDPOINT = process.env.URI_NOTIFY_ENDPOINT;
const invoker = new FunctionInvoker(URI_NOTIFY_ENDPOINT, SERVERLESS_STAGE);

export default (userId, elementId, details, notificationType) => {
  console.info(`Notifying ${notificationType} for elementId ${elementId}`);

  let notificationInfo = JSON.stringify({
    recipientIds: [userId],
    type: notificationType,
    emitterId: SYSTEM_EMITTER,
    elementId,
    details,
    pending: true
  });

  return invoker.invoke({ body: notificationInfo, type: INVOKE_TYPE.Event });
};
