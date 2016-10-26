import DeviceUserModel from '../commons/resources/device-user-model';
import Notification from '../commons/remote/notification';
import { ERR_AWS } from '../commons/constants';

const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;
const PLATFORM_ARN_IOS = process.env.PLATFORM_ARN_IOS;
const IOS_PLATFORM_TYPE = 'ios';

const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function registerDevice(userId, deviceData) {
  let { device_token, platform, language, os_version, device } = deviceData;

  if (!device_token) {
    throw new Error('InvalidDeviceToken');
  }

  console.info(`Registering device ${device_token} for user ${userId}`);

  return Notification.createDeviceEndpoint(userId, device_token, resolvePlatformId(platform))
    .then(endpoint => {
      let deviceData = {
        user_id: userId,
        device_token,
        platform,
        endpoint,
        language,
        os_version,
        device,
        accessed_at: new Date().toISOString()
      };

      return deviceByUserModel.create(deviceData)
        .then(() => ({ message: 'OK' }));
    })
    .catch(err => {
      if (err.code === ERR_AWS.INVALID_PARAMS) {
        console.info('Overwriting endpoint for user ' + userId);
        // deleteEndoint
        return deleteEndoint(device_token)
          // re-registerDevice
          .then(() => registerDevice(userId, device_token, platform));
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
