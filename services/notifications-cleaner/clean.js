import NotificationModel from '../commons/resources/notification-model';
import { SUCCESS } from '../commons/constants';

const URI_NOTIFICATION = process.env.URI_NOTIFICATION;

const notificationModel = new NotificationModel(URI_NOTIFICATION);

export function cleanElementNotifications(elementId, userId, isOwner) {
  let ownership = isOwner ? 'owner' : 'not owner';
  console.info(`Cleaning notifications for element ${elementId} with user ${userId}(${ownership})`);

  // get notifications
  return notificationModel.getNotificationsForElement(elementId, isOwner ? null : userId)
    .then(notifications => {
      let keys = notifications.map(n => ({ user_id: n.user_id, created_at: n.created_at }));
      return notificationModel.batchRemove(keys);
    })
    .then(() => SUCCESS);
}

export function cleanAudioNotifications(elementId, audioId) {
  console.info(`Cleaning notifications for audio ${audioId} with element ${elementId}`);
  return notificationModel.getNotificationsForElement(elementId, null)
    .then(notifications => {
      // filter notifications for audioId
      let keys = notifications.filter(n => n.details.audio_id === audioId)
        .map(n => ({ user_id: n.user_id, created_at: n.created_at }));

      return notificationModel.batchRemove(keys);
    })
    .then(() => SUCCESS);
}
