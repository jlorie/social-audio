import NotificationModel from '../commons/resources/notification-model';

const MAX_NOTIFICATIONS = 20;

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export function markElementAsViewed(elementId, userId) {
  console.info('Marking element ' + elementId + ' as viewed for user ' + userId);
  return notificationModel.getPendingNotifications({ userId, elementId, limit: MAX_NOTIFICATIONS })
    .then(notifications => Promise.all(notifications.map(updateNotification)));
}

function updateNotification(notification) {
  let key = {
    user_id: notification.user_id,
    created_at: notification.created_at
  };

  return notificationModel.update(key, { viewed: true });
}
