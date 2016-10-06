import ElementUserModel from '../commons/resources/element-user-model';
import NotificationModel from '../commons/resources/notification-model';

import { REF_STATUS } from '../commons/constants';

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const notificationModel = new NotificationModel(URI_NOTIFICATIONS);
const elementsByUsers = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export default (ref) => {
  console.info(`Updating ref for element ${ref.id} and user ${ref.user_id} as expired`);
  return elementsByUsers.update(ref.id, ref.user_id, { ref_status: REF_STATUS.EXPIRED })
    .then(() => markRequestNotifications(ref.user_id, ref.id));
};

// Mark pending request as resolved
function markRequestNotifications(userId, elementId) {
  return notificationModel.getPendingRequest({ userId, elementId })
    .then(notifications => {
      let update = (notification) => {
        console.info('Updating notification ' + notification.id);

        let key = {
          user_id: notification.user_id,
          created_at: notification.created_at
        };

        let data = { details: { pending: false } };
        return notificationModel.updateMarkNotification(key, data);
      };

      return Promise.all(notifications.map(update));
    });
}
