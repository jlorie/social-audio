import Notification from '../commons/remote/notification';

const ERR_ENDPOINT_DISABLED = 'EndpointDisabled';
const ERR_INVALID_PARAMETER = 'InvalidParameter';

export default () => {
  let device = {
    endpoint: 'arn:aws:sns:us-east-1:141310850160:endpoint/APNS/prod-bbluue-ios/47bcfb36-8a74-33e8-b557-5127659cf887'
  };
  let message = 'This is a test';
  let badge = 1;
  let type = 'new_audio';

  return notify(device, message, badge, type);
};

function notify(device, message, bagde, type, retries = 0) {
  console.info('Notifying device with endpoint ' + device.endpoint);
  const notification = new Notification(device.endpoint);

  let apns = JSON.stringify({
    APNS: JSON.stringify({
      aps: {
        alert: message,
        sound: 'default',
        badge: bagde,
        type
      }
    })
  });

  return notification.push(apns, true)
    .catch(err => {
      console.log('==> Error: ', JSON.stringify(err, null, 2));
      if (err.code === ERR_ENDPOINT_DISABLED) {
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

      if (err.code === ERR_INVALID_PARAMETER && err.message.indexOf('No endpoint found')) {
        console.info(`Invalid endpoint ${device.endpoint}, deleting it...`);
        return deleteDeviceEndpoint(device);
      }

      throw err;
    });
}

function deleteDeviceEndpoint(device) {
  console.log('Deleting device with endpoint ' + device.endpoint);
  return 'OK';
}
