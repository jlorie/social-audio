import NotificationModel from '../commons/resources/notification-model';

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);
const SHARE_ACTION = 'shared_element';

export function logSharedElement(element, userId, recipientIds) {
  console.info('Logging new share notification for ' + recipientIds);

  let logs = [];
  for (let recipientId of recipientIds) {
    let log = {
      user_id: recipientId,
      created_at: new Date().toISOString(),
      action: SHARE_ACTION,
      from: userId,
      element_id: element.id
    };

    logs.push(log);
  }

  return notificationModel.batchCreate(logs);
}
