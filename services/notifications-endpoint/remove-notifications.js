import NotificationModel from '../commons/resources/notification-model';
import { SUCCESS, ERR_NOTIFICATIONS } from '../commons/constants'

const MAX_NOTIFICATIONS = 20;
const URI_NOTIFICATION = process.env.URI_NOTIFICATION;
const notificationModel = new NotificationModel(URI_NOTIFICATION);

export function remove(notificationId, userId) {
  console.info('Deleting notification ' + notificationId + ' for user ' + userId);

  return notificationModel.getByUserId({ userId, id: notificationId, limit: MAX_NOTIFICATIONS })
    .then(notifications => {
      let notification = notifications[0];
      if (!notification) {
        throw new Error(ERR_NOTIFICATIONS.INVALID_NOTIFICATION);
      }

      let keys = {
        user_id: userId,
        created_at: notification.created_at
      };

      return notificationModel.remove(keys).then(() => SUCCESS);
    });
}
