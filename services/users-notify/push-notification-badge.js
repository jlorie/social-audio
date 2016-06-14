import UserLogModel from '../commons/resources/user-log-model';
import NotificationModel from '../commons/resources/notification-model';

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const URI_USERS_LOG_ENDPOINT = process.env.URI_USERS_LOG_ENDPOINT;

const userLogModel = new UserLogModel(URI_USERS_LOG_ENDPOINT);
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export function resolveNotificationBadge(recipientIds) {
  console.info('Resolving pending notifications for ' + recipientIds);

  let pending = new Map();
  let promise = Promise.all(recipientIds.map(userId => {
    console.info('Getting pending notifications for user ' + userId);

    return getDateForLastNotificationRequest(userId)
      .then(date => notificationModel.getNotificationsFrom({ userId, date }))
      .then(notifications => {
        pending.set(userId, notifications.length);
        return 'OK';
      });
  }));

  return promise.then(() => pending);
}

function getDateForLastNotificationRequest(userId) {
  return userLogModel.get({ userId, action: 'get_notifications' })
    .then(results => {
      let lastLog = results[0];
      if (!lastLog) {
        return Promise.resolve(new Date().toISOString());
      }

      return lastLog.created_at;
    });
}
