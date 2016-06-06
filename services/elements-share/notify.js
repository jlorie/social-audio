import _ from 'lodash';
import DeviceUserModel from '../commons/resources/device-user-model';
import Notification from '../commons/remote/notification';

const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;
const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function notifySharedElement(element, ownerId, recipientIds) {
  console.info(`Notifying shared element ${element.id} from ${ownerId} to ${recipientIds}`);

  // Construct notification message
  let message = `${ownerId} is asking you to add an audiography`;

  // Getting token for user's devices
  return Promise.all(recipientIds.map(id => deviceByUserModel.getByUserId(id)))
    .then(results => {
      let devices = _.flattenDeep(results);
      return Promise.all(devices.map(device => {
        // Notifying every device
        const notification = new Notification(device.endpoint);
        return notification.push(message);
      }));
    });
}
