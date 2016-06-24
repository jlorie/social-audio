import DeviceUserModel from '../commons/resources/device-user-model';
import Notification from '../commons/remote/notification';
import { ERR_AWS } from '../commons/constants';

const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;
const PLATFORM_ARN_IOS = process.env.PLATFORM_ARN_IOS;
const IOS_PLATFORM_TYPE = 'ios';

const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function registerDevice(userId, deviceToken, platform) {
  if (!deviceToken) {
    throw new Error('InvalidDeviceToken');
  }

  console.info(`Registering device ${deviceToken} for user ${userId}`);

  return Notification.createDeviceEndpoint(userId, deviceToken, resolvePlatformId(platform))
    .then(endpoint => {
      let deviceData = {
        user_id: userId,
        device_token: deviceToken,
        platform,
        endpoint,
        accessed_at: new Date().toISOString()
      };

      return deviceByUserModel.create(deviceData)
        .then(() => ({ message: 'OK' }));
    })
    .catch(err => {
      if (err.code === ERR_AWS.INVALID_PARAMS) {
        console.info('Overwriting endpoint for user ' + userId);
        // deleteEndoint
        return deleteEndoint(deviceToken)
          // re-registerDevice
          .then(() => registerDevice(userId, deviceToken, platform));
      }

      throw err;
    });
}

function resolvePlatformId(platform) {
  let platformId;

  switch (platform) {
    case IOS_PLATFORM_TYPE:
      {
        platformId = PLATFORM_ARN_IOS;
        break;
      }

    default:
      {
        platformId = null;
      }
  }

  return platformId;
}

function deleteEndoint(deviceToken) {
  console.info('Deleting endpoint with token ' + deviceToken);

  // find device
  return deviceByUserModel.findByToken(deviceToken)
    .then(deviceData => {
      // delete endpoint
      return Notification.deleteDeviceEndpoint(deviceData.endpoint)
        .then(() => {
          // delete record
          let key = {
            user_id: deviceData.user_id,
            device_token: deviceData.device_token
          };

          deviceByUserModel.remove(key);
        });
    });
}
