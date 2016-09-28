import NotificationModel from '../commons/resources/notification-model';

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export function markRequestAsResolved(userId, elementId) {
  console.info('Marking audio request for element ' + elementId + ' as resolved');
  return notificationModel.getPendingNotifications({ userId, elementId })
    .then(notifications => Promise.all(notifications.map(updateNotification)));
}

function updateNotification(notification) {
  console.info(' Updating notification : ', JSON.stringify(notification, null, 2));
  let key = {
    user_id: notification.user_id,
    created_at: notification.created_at
  };

  let data = {
    details: {
      pending: false
    }
  };

  return notificationModel.updateMarkNotification(key, data);
}
