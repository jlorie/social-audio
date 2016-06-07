import NotificationModel from '../commons/resources/notification-model';

const MAX_NOTIFICATIONS = 20;
const URI_NOTIFICATION = process.env.URI_NOTIFICATION;
const notificationModel = new NotificationModel(URI_NOTIFICATION);

export function list(userId) {
  console.info('Listing notifications for user: ' + userId);
  return notificationModel.getByUserId({ userId, limit: MAX_NOTIFICATIONS })
    .then(notifications => notifications.map(info => {
      delete info.user_id;
      return info;
    }));
}
