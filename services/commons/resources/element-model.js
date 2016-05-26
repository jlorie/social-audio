import ResourceModel from './resource-model';

class ElementModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }
}

export default ElementModel;
