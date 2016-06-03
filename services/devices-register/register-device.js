import DeviceUserModel from '../commons/resources/device-user-model';

const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;
const deviceByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function registerDevice(userId, deviceToken, platform) {
  if (!deviceToken) {
    throw new Error('InvalidDeviceToken');
  }

  console.info(`Registering device ${deviceToken} for user ${userId}`);
  let deviceData = {
    user_id: userId,
    device_token: deviceToken,
    platform
  };

  return deviceByUserModel.create(deviceData)
    .then(() => ({ message: 'OK' }));
}
