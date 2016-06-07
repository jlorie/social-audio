import uuid from 'node-uuid';
import UserModel from '../commons/resources/user-model';
import NotificationModel from '../commons/resources/notification-model';

const AUDIO_REQUEST_TYPE = 'audio_request';
const URI_USERS = process.env.URI_USERS;
const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;

const userModel = new UserModel(URI_USERS);
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export function logSharedElement(element, emitterId, recipientIds) {
  console.info('Logging new share notification for ' + recipientIds);

  return userModel.getById(emitterId)
    .then(emitter => {
      let logs = [];
      for (let recipientId of recipientIds) {
        let log = {
          id: uuid.v1(),
          user_id: recipientId,
          created_at: new Date().toISOString(),
          type: AUDIO_REQUEST_TYPE,
          emitter_id: emitterId,
          element_id: element.id,
          viewed: false,
          details: {
            thumbnail_url: element.thumbnail_url,
            emitter_name: emitter.fullname
          }
        };

        logs.push(log);
      }

      return notificationModel.batchCreate(logs);
    });
}
