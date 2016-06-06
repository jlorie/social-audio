import _ from 'lodash';
import UserModel from '../commons/resources/user-model';
import DeviceUserModel from '../commons/resources/device-user-model';
import Notification from '../commons/remote/notification';

const URI_USERS = process.env.URI_USERS;
const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;

const userModel = new UserModel(URI_USERS);
const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function notifySharedElement(element, ownerId, recipientIds) {
  console.info(`Notifying shared element ${element.id} from ${ownerId} to ${recipientIds}`);

  return userModel.getById(ownerId)
    .then(owner => {
      // Construct notification message
      let message = generateMessage(owner.fullname);

      // Getting token for user's devices
      return Promise.all(recipientIds.map(id => deviceByUserModel.getByUserId(id)))
        .then(results => {
          let devices = _.flattenDeep(results);
          return Promise.all(devices.map(device => {
            // Notifying every device
            const notification = new Notification(device.endpoint);
            return notification.push(message, true);
          }));
        });
    });
}

function generateMessage(ownerName) {
  let notification = {
    APNS: JSON.stringify({
      aps: {
        alert: `${ownerName} is asking you to add an audiography`,
        sound: 'default',
      }
    })
  };

  return JSON.stringify(notification);
}
