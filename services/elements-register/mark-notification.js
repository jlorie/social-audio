import NotificationModel from '../commons/resources/notification-model';
import { MAX_NOTIFICATIONS } from '../commons/constants';

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export function markRequestAsResolved(userId, elementId) {
  console.info('Marking audio request for element ' + elementId + ' as resolved');
  return notificationModel.getPendingRequest({ userId, elementId, limit: MAX_NOTIFICATIONS })
    .then(notifications => Promise.all(notifications.map(updateNotification)));
}

function updateNotification(notification) {
  console.log('==> notification: ', JSON.stringify(notification, null, 2));

  let key = {
    user_id: notification.user_id,
    created_at: notification.created_at
  };

  let data = {
    pending: false
  };

  return notificationModel.update(key, data);
}
