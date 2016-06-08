import FunctionInvoker from '../commons/remote/function-invoker';
import { INVOKE_TYPE } from '../commons/remote/function-invoker';
import UserModel from '../commons/resources/user-model';
import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';

const NEW_AUDIO_TYPE = 'new_audio';

const URI_USERS = process.env.URI_USERS;
const URI_ELEMENTS_RESOURCE = process.env.URI_ELEMENTS_RESOURCE;
const URI_NOTIFY_ENDPOINT = process.env.URI_NOTIFY_ENDPOINT;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const userModel = new UserModel(URI_USERS);
const elementModel = new ElementModel(URI_ELEMENTS_RESOURCE);
const invoker = new FunctionInvoker(URI_NOTIFY_ENDPOINT);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function notifyNewAudio(ownerId, elementId) {
  console.info('Notifying new audio uploaded for users related to element ' + elementId);

  // get users related to the element
  return elementsByUserModel.getById(elementId)
    .then(elements => {
      // get ids for recipients
      let recipientIds = elements.filter(e => e.user_id !== ownerId).map(e => e.user_id);

      // get details
      return getNotificationDetails(elementId, ownerId)
        .then(details => {
          let body = JSON.stringify({
            emitterId: ownerId,
            type: NEW_AUDIO_TYPE,
            elementId,
            details,
            recipientIds
          });

          return invoker.invoke({ body, type: INVOKE_TYPE.Event });
        });
    });
}


function getNotificationDetails(elementId, userId) {
  let tasks = [
    getThumbnailUrl(elementId), // thumb url
    getUsername(userId) // user name
  ];

  return Promise.all(tasks)
    .then(results => {
      let details = {
        thumbnail_url: results[0],
        emitter_name: results[1]
      };

      return details;
    });
}

function getThumbnailUrl(elementId) {
  return elementModel.getById(elementId)
    .then(element => {
      if (!element) {
        throw new Error('InvalidElementId');
      }

      return element.thumbnail_url;
    });
}

function getUsername(userId) {
  return userModel.getById(userId)
    .then(user => {
      if (!user) {
        throw new Error('InvalidUserId');
      }

      return user.fullname;
    });
}
