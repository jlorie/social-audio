import _ from 'lodash';
import Notification from '../commons/remote/notification';

import UserModel from '../commons/resources/user-model';
import DeviceUserModel from '../commons/resources/device-user-model';
import NotificationModel from '../commons/resources/notification-model';

const URI_USERS = process.env.URI_USERS;
const URI_NOTIFICATIONS = process.env.URI_NOTIFICATIONS;
const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;
const MAX_NOTIFICATIONS = 20;

const userModel = new UserModel(URI_USERS);
const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export function notifySharedElement(element, ownerId, recipientIds) {
  console.info(`Notifying shared element ${element.id} from ${ownerId} to ${recipientIds}`);

  let pendingNotifications;
  return getPendingNotificationsByUsers(recipientIds)
    .then(map => {
      pendingNotifications = map;
      return 'OK';
    })
    .then(() => userModel.getById(ownerId))
    .then(owner => {
      // Getting token for user's devices
      return Promise.all(recipientIds.map(id => deviceByUserModel.getByUserId(id)))
        .then(results => {
          let devices = _.flattenDeep(results);
          return Promise.all(devices.map(device => {
            // Notifying every device
            const notification = new Notification(device.endpoint);
            let message = generateMessage(owner, pendingNotifications.get(device.user_id));
            return notification.push(message, true);
          }));
        });
    });
}

function generateMessage(owner, pending) {
  let notification = {
    APNS: JSON.stringify({
      aps: {
        alert: `${owner.fullname} is asking you to add an audiography`,
        sound: 'default',
        badge: pending + 1
      }
    })
  };

  return JSON.stringify(notification);
}

function getPendingNotificationsByUsers(recipientIds) {
  console.info('Getting pending notifications...');

  let pending = new Map();
  return Promise.all(recipientIds.map(userId => {
      return notificationModel.getPendingNotifications({ userId, limit: MAX_NOTIFICATIONS })
        .then(notifications => {
          pending.set(userId, notifications.length);
          return 'OK';
        });
    }))
    .then(() => pending);
}
