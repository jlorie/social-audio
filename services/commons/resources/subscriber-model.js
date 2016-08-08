import ResourceModel from './resource-model';

class SubscriberModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  create(data) {
    const func = (resolve, reject) => {
      let params = {
        TableName: this.tableName,
        Item: data,
        ConditionExpression: 'attribute_not_exists(email)',
      };

      this.dynamo.put(params, err => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    };

    return new Promise(func);
  }

}

export default SubscriberModel;
