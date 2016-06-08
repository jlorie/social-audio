import _ from 'lodash';
import Notification from '../commons/remote/notification';

import DeviceUserModel from '../commons/resources/device-user-model';
const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;
const ERR_ENDPOINT_DISABLED = 'EndpointDisabled';

const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function notify({ recipientIds, message, pendingMap }) {
  console.info(`Notifying via push to ${recipientIds}`);

  // Getting endpoint for user's devices
  return Promise.all(recipientIds.map(id => deviceByUserModel.getByUserId(id)))
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
