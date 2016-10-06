import ElementUserModel from '../commons/resources/element-user-model';
import NotificationModel from '../commons/resources/notification-model';
import { REF_STATUS } from '../commons/constants';

const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export default (element) => {
  console.info(`Marking reference ${element.id} for user ${element.owner_id} as resolved`);
  let createdAtData = [element.created_at, element.uploaded_at, 'owner'];
  let key = {
    user_id: element.owner_id,
    created_at: createdAtData.filter(i => i).join('|')
  };

  // update and remove expire date
  return elementsByUserModel.rawUpdate(key, { ref_status: REF_STATUS.RESOLVED }, ['expire_at'])
    .then(() => markNotifications(element.owner_id, element.id));
};

function markNotifications(userId, elementId) {
  console.info('Marking notifications for element ' + elementId + ' as resolved');

  return notificationModel.getPendingNotifications({ userId, elementId })
    .then(notifications => {
      const updateTask = (notification) => {
        console.info('Updating notification ' + notification.id);
        let key = {
          user_id: notification.user_id,
          created_at: notification.created_at
        };

        let data = { details: { pending: false } };
        return notificationModel.updateMarkNotification(key, data);
      };

      return Promise.all(notifications.map(updateTask));
    });
}
