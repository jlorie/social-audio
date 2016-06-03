import ResourceModel from './resource-model';

class DeviceUserModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

}


export default DeviceUserModel;
