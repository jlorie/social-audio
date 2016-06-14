import _ from 'lodash';
import Notification from '../commons/remote/notification';

import DeviceUserModel from '../commons/resources/device-user-model';
import { resolveNotificationBadge } from './push-notification-badge';
import { NOTIFICATION_TYPE } from '../commons/constants';

const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;
const ERR_ENDPOINT_DISABLED = 'EndpointDisabled';

const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function push(recipients, type, elementId, emitter) {
  let isEmpty = recipients.length === 0;
  if (isEmpty) {
    return Promise.resolve('OK');
  }

  // Discarding users with notification disabled
  let users = recipients.filter(user => user.notifications_enabled);
  let userIds = users.map(user => user.id);

  let tasks = [
    resolveNotificationBadge(userIds), // badge
    resolveEndpointDevices(userIds) // device endpoint
  ];

  return Promise.all(tasks)
    .then(tasksResult => {
      const badgeMap = tasksResult[0];
      const devices = tasksResult[1];
      const message = resolveMessage(emitter, type);

      return Promise.all(devices.map(device => {
        let badge = badgeMap.get(device.user_id);
        return notify(device.endpoint, message, badge);
      }));
    });
}


function notify(deviceEndpoint, message, bagde) {
  // Notifying every device
  const notification = new Notification(deviceEndpoint);

  let apns = JSON.stringify({
    APNS: JSON.stringify({
      aps: {
        alert: message,
        sound: 'default',
        badge: bagde
      }
    })
  });

  console.info('Sending push: ', apns);

  return notification.push(apns, true)
    .catch(err => {
      if (err.code !== ERR_ENDPOINT_DISABLED) {
        throw err;
      }
      console.info(`Endpoint ${deviceEndpoint}  is disabled`);
    });
}

function resolveMessage(emitter, type) {
  console.info('Resolving notification message ' + type + ' for user ' + emitter.id);

  let message;
  switch (type) {
    case NOTIFICATION_TYPE.AUDIO_REQUEST:
      {
        message = `${emitter.fullname} is asking you to add an audiography`;
        break;
      }
    case NOTIFICATION_TYPE.NEW_AUDIO:
      {
        message = `${emitter.fullname} added a new audiography`;
        break;
      }
    default:
      {
        throw new Error('InvalidType');
      }
  }

  return message;
}

function resolveEndpointDevices(userIds) {
  console.info(`Resolving devices endpoint for user ${userIds.length} users`);

  // Getting endpoint for user's devices
  return Promise.all(userIds.map(id => deviceByUserModel.getByUserId(id)))
    .then(results => _.flattenDeep(results));
}
