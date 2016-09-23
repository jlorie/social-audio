import UserModel from '../commons/resources/user-model';
import FunctionInvoker, { INVOKE_TYPE } from '../commons/remote/function-invoker';

const AUDIO_REQUEST_TYPE = 'audio_request';
const URI_USERS = process.env.URI_USERS;
const URI_NOTIFY_ENDPOINT = process.env.URI_NOTIFY_ENDPOINT;
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;

const userModel = new UserModel(URI_USERS);
const invoker = new FunctionInvoker(URI_NOTIFY_ENDPOINT, SERVERLESS_STAGE);

export function notifySharedElement(element, ownerId, recipientIds) {
  console.info(`Notifying shared element ${element.id} from ${ownerId} to ${recipientIds}`);

  return userModel.getById(ownerId)
    .then(emitter => {
      let notificationInfo = JSON.stringify({
        recipientIds,
        type: AUDIO_REQUEST_TYPE,
        emitterId: emitter.id,
        elementId: element.id,
        details: {
          thumbnail_url: element.thumbnail_url,
          emitter_name: emitter.fullname
        }
      });

      return invoker.invoke({ body: notificationInfo, type: INVOKE_TYPE.Event });
    });
}
