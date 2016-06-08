import NotificationModel from '../commons/resources/notification-model';

const MAX_NOTIFICATIONS = process.env.MAX_NOTIFICATIONS;
const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export function resolvePendingNotifications(recipientIds) {
  console.info('Resolving pending notifications for ' + recipientIds);

  let pending = new Map();
  let promise = Promise.all(recipientIds.map(userId => {
    console.info('Getting pending notifications for user ' + userId);

    return notificationModel.getPendingNotifications({ userId, limit: MAX_NOTIFICATIONS })
      .then(notifications => {
        pending.set(userId, notifications.length);
        return 'OK';
      });
  }));

  return promise.then(() => pending);
}
