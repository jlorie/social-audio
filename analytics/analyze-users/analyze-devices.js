import _ from 'lodash';
import ResourceModel from '../commons/resources/resource-model';

const URI_DEVICES = process.env.URI_DEVICES;
const SERVERLESS_REGION = process.env.SERVERLESS_REGION;

const deviceModel = new ResourceModel(URI_DEVICES, SERVERLESS_REGION);
export default () => {
  let output = {
    all: 0,
    platforms: {}
  };

  console.info('Getting devices info ...');
  return deviceModel.get()
    .then(devices => {
      output.all = devices.length;

      for (let device of devices) {
        // Setting up unknown platforms
        if (!_.has(device, 'platform')) {
          device.platform = 'unknown';
        }

        if (!_.has(output.platforms, device.platform)) {
          output.platforms[device.platform] = {
            count: 0,
            devices: {},
            languages: {},
            os: {}
          };
        }

        let platform = output.platforms[device.platform];
        platform.count++;

        // devices
        if (device.device) {
          platform.devices[device.device] = (platform.devices[device.device] || 0) + 1;
        } else {
          platform.devices.unknown = (platform.devices.unknown || 0) + 1;
        }

        // languages
        if (device.language) {
          platform.languages[device.language] = (platform.languages[device.language] || 0) + 1;
        } else {
          platform.languages.unknown = (platform.languages.unknown || 0) + 1;
        }

        // os_version
        if (device.os_version) {
          platform.os[device.os_version] = (platform.os[device.os_version] || 0) + 1;
        } else {
          platform.os.unknown = (platform.os.unknown || 0) + 1;
        }
      }

      return output;
    });
};
