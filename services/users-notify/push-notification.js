import _ from 'lodash';
import Notification from '../commons/remote/notification';

import UserModel from '../commons/resources/user-model';
import DeviceUserModel from '../commons/resources/device-user-model';

const URI_USERS = process.env.URI_USERS;
const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;
const ERR_ENDPOINT_DISABLED = 'EndpointDisabled';

const userModel = new UserModel(URI_USERS);
const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function notify({ recipientIds, message, pendingMap }) {
  // Discarding users with notification disabled
  return getNotificationActiveUsers(recipientIds)
    .then(userIds => {
      let isEmpty = userIds.length === 0;
      if (!isEmpty) {
        console.info(`Notifying via push to ${userIds}`);
      }
      // Getting endpoint for user's devices
      return Promise.all(userIds.map(id => deviceByUserModel.getByUserId(id)));
    })
    .then(results => {
      let devices = _.flattenDeep(results);

      return Promise.all(devices.map(device => {
        // Notifying every device
        const notification = new Notification(device.endpoint);

        let apns = JSON.stringify({
          APNS: JSON.stringify({
            aps: {
              alert: message,
              sound: 'default',
              badge: pendingMap.get(device.user_id)
            }
          })
        });

        return notification.push(apns, true)
          .catch(err => {
            if (err.code !== ERR_ENDPOINT_DISABLED) {
              throw err;
            }
            console.info(`Endpoint ${device.endpoint} for user ${device.user_id} is disabled`);
          });
      }));
    });
}

function getNotificationActiveUsers(userIds) {
  return Promise.all(userIds.map(id => userModel.getById(id)))
    .then(users => users.filter(u => u.notifications_enabled))
    .then(filtered => filtered.map(u => u.id));
}
