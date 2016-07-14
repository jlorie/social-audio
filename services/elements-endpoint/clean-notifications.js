import FunctionInvoker, { INVOKE_TYPE } from '../commons/remote/function-invoker';

const URI_CLEAN_NOTIFICATIONS = process.env.URI_CLEAN_NOTIFICATIONS;
const invoker = new FunctionInvoker(URI_CLEAN_NOTIFICATIONS);

export function cleanNotifications(elementIds, userId, isOwner) {
  console.info(`Cleaning notifications for ${elementIds.length} element with user ${userId}`);

  let promises = elementIds.map(elementId => {
    let params = {
      type: INVOKE_TYPE.Event,
      body: JSON.stringify({
        element_id: elementId,
        user_id: userId,
        owner: isOwner
      })
    };

    return invoker.invoke(params);
  });

  return Promise.all(promises);
}
