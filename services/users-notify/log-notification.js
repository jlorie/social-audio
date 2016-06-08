import uuid from 'node-uuid';
import NotificationModel from '../commons/resources/notification-model';

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export function log({ emitterId, type, elementId, details, recipientIds }) {
  console.info('Logging new notification for ' + recipientIds);

  let logs = [];
  for (let recipientId of recipientIds) {
    let log = {
      id: uuid.v1(),
      user_id: recipientId,
      created_at: new Date().toISOString(),
      emitter_id: emitterId,
      element_id: elementId,
      viewed: false,
      type,
      details
    };

    logs.push(log);
  }

  return notificationModel.batchCreate(logs);
}
