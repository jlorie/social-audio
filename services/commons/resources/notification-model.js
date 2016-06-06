import ResourceModel from './resource-model';

class NotificationModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }
}


export default NotificationModel;
