import NotificationModel from '../commons/resources/notification-model';
import { MAX_NOTIFICATIONS } from '../commons/constants';

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export function markElementAsViewed(elementId, userId) {
  console.info('Marking element ' + elementId + ' as viewed for user ' + userId);
  return notificationModel.getPendingNotifications({ userId, elementId, viewed: false, limit: MAX_NOTIFICATIONS })
    .then(notifications => Promise.all(notifications.map(updateNotification)));
}

function updateNotification(notification) {
  let key = {
    user_id: notification.user_id,
    created_at: notification.created_at
  };

  return notificationModel.update(key, { viewed: true });
}


export function markRequestAsResolved(userId, elementId) {
  console.info('Marking audio request for element ' + elementId + ' as resolved');
  return notificationModel.getPendingNotifications({ userId, elementId })
    .then(notifications => Promise.all(notifications.map(markNotification)));
}

function markNotification(notification) {
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
