import FunctionInvoker, { INVOKE_TYPE } from '../commons/remote/function-invoker';

const URI_CLEAN_NOTIFICATIONS = process.env.URI_CLEAN_NOTIFICATIONS;
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;

const invoker = new FunctionInvoker(URI_CLEAN_NOTIFICATIONS, SERVERLESS_STAGE);

export function cleanElementsNotifications(elementIds, userId, isOwner) {
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

export function cleanAudioNotifications(elementId, audioId) {
  console.info(`Cleaning notifications for audio ${audioId} with element ${elementId}`);

  let params = {
    type: INVOKE_TYPE.Event,
    body: JSON.stringify({
      element_id: elementId,
      audio_id: audioId
    })
  };

  return invoker.invoke(params);
}
