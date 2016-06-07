import uuid from 'node-uuid';
import NotificationModel from '../commons/resources/notification-model';

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);
const AUDIO_REQUEST_TYPE = 'audio_request';

export function logSharedElement(element, userId, recipientIds) {
  console.info('Logging new share notification for ' + recipientIds);

  let logs = [];
  for (let recipientId of recipientIds) {
    let log = {
      id: uuid.v1(),
      user_id: recipientId,
      created_at: new Date().toISOString(),
      type: AUDIO_REQUEST_TYPE,
      emitter_id: userId,
      element_id: element.id,
      viewed: false
    };

    logs.push(log);
  }

  return notificationModel.batchCreate(logs);
}
