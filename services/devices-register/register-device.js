import DeviceUserModel from '../commons/resources/device-user-model';
import Notification from '../commons/remote/notification';

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
