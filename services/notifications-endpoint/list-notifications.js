import UserLogModel from '../commons/resources/user-log-model';
import NotificationModel from '../commons/resources/notification-model';

const MAX_NOTIFICATIONS = 50;
const URI_NOTIFICATION = process.env.URI_NOTIFICATION;
const URI_USERS_LOG_ENDPOINT = process.env.URI_USERS_LOG_ENDPOINT;

const userLogModel = new UserLogModel(URI_USERS_LOG_ENDPOINT);
const notificationModel = new NotificationModel(URI_NOTIFICATION);

export function list(userId) {
  console.info('Listing notifications for user: ' + userId);
  let tasks = [
    getNotifications(userId),
    logUserAction(userId)
  ];

  return Promise.all(tasks)
    .then(results => results[0]);
}

function logUserAction(userId) {
  return userLogModel.log({ userId, userAction: 'get_notifications' });
}

function getNotifications(userId) {
  return notificationModel.getByUserId({ userId, limit: MAX_NOTIFICATIONS })
    .then(notifications => notifications.map(info => {
      delete info.user_id;
      return info;
    }));
}
