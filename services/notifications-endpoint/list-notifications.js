import NotificationModel from '../commons/resources/notification-model';

const URI_NOTIFICATION = process.env.URI_NOTIFICATION;
const notificationModel = new NotificationModel(URI_NOTIFICATION);

export function list(userId) {
  console.info('Listing notifications for user: ' + userId);
  return notificationModel.getByUserId(userId, 20)
    .then(notifications => notifications.map(info => {
      delete info.user_id;
      return info;
    }));
}
