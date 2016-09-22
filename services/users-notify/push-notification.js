import _ from 'lodash';
import Notification from '../commons/remote/notification';

import DeviceUserModel from '../commons/resources/device-user-model';
import { resolveNotificationBadge } from './push-notification-badge';
import { NOTIFICATION_TYPE, ERR_NOTIFICATIONS } from '../commons/constants';

const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;
const ERR_ENDPOINT_DISABLED = 'EndpointDisabled';
const MAX_RETRIES = 3;

const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function push(recipients, type, elementId, emitter, details) {
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
      const message = resolveMessage(emitter, type, details);
      const devices = tasksResult[1];

      return Promise.all(devices.map(device => {
        let badge = badgeMap.get(device.user_id);
        // Si no funciona borrar elementId
        return notify(device, message, badge, type, elementId);
      }));
    });
}

// Si no funciona borrar idReference
function notify(device, message, bagde, type, idReference, retries = 0) {
  console.info('Notifying device with endpoint ' + device.endpoint);
  const notification = new Notification(device.endpoint);

  // Si no funciona borrar reference
  let apns = JSON.stringify({
    APNS: JSON.stringify({
      aps: {
        alert: message,
        sound: 'default',
        reference: idReference,
        badge: bagde,
        type
      }
    })
  });

  return notification.push(apns, true)
    .catch(err => {
      if (err.code === ERR_NOTIFICATIONS.ENDPOINT_DISABLED) {
        console.info(`Endpoint ${device.endpoint}  is disabled, deleting endpoint`);
        return deleteDeviceEndpoint(device);

        // TODO check
        // if (retries >= MAX_RETRIES) {
        //   console.info('Deleting device endpoint ' + device.endpoint);
        //   return deleteDeviceEndpoint(device);
        // }
        //
        // // enable endpoint & retry
        // return Notification.enableDeviceEndpoint(device.endpoint, device.device_token)
        //   .then(() => notify(device, message, bagde, type, retries + 1));
      }

      if (err.code === ERR_NOTIFICATIONS.INVALID_PARAMETER &&
        err.message.indexOf('No endpoint found')) {
        console.info(`Invalid endpoint ${device.endpoint}, deleting it...`);
        return deleteDeviceEndpoint(device);
      }

      throw err;
    });
}

function resolveMessage(emitter, type, details) {
  console.info('Resolving notification message with ' + type);

  let message;
  switch (type) {
    case NOTIFICATION_TYPE.AUDIO_REQUEST:
      {
        message = emitter.fullname + ' is asking you to add an audiography. ' +
        'Please record an emotion, a comment, learning experience or just something funny';
        break;
      }
    case NOTIFICATION_TYPE.NEW_AUDIO:
      {
        message = `${emitter.fullname} added a new audiography`;
        break;
      }
    case NOTIFICATION_TYPE.PENDING_AUDIO:
      {
        message = 'It has been some time since ' + details.element_owner_name + ' ' +
        'has sent you a request to add an Audiography you like to do it now ?';
        break;
      }
    case NOTIFICATION_TYPE.PENDING_ELEMENT_EXPIRED:
      {
        message = details.element_owner_name + ' audiography request has expired';
        break;
      }
    case NOTIFICATION_TYPE.INACTIVE_ELEMENT:
      {
        message = 'In order to save only the moments you really care, ' +
        'bbluue will remove photos without any audiography. Do you want to ask ' +
        'a friend for an audiography now ?';
        break;
      }
    case NOTIFICATION_TYPE.INACTIVE_ELEMENT_EXPIRED:
      {
        message = 'In order to save only the moments you really care, ' +
        'bbluue will remove photos without any audiography. Do you want to ' +
        'download to your device now ?';
        break;
      }

    default:
      {
        message = 'Unknown notification type';
      }
  }

  console.info('Message: ', message);
  return message;
}

function resolveEndpointDevices(userIds) {
  console.info(`Resolving devices endpoint for user ${userIds.length} users`);

  // Getting endpoint for user's devices
  return Promise.all(userIds.map(id => deviceByUserModel.getByUserId(id)))
    .then(results => _.flattenDeep(results));
}

// TODO remove endpoint by dynamo stream
function deleteDeviceEndpoint(device) {
  // delete endpoint
  let key = {
    user_id: device.user_id,
    device_token: device.device_token
  };

  return deviceByUserModel.remove(key)
    .then(() => Notification.deleteDeviceEndpoint(device.endpoint));
}
