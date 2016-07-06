import ResourceModel from './resource-model';

class DeviceUserModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  getByUserId(userId) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
      }
    };

    const promise = (resolve, reject) => {
      this.dynamo.query(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data.Items);
      });
    };

    return new Promise(promise);
  }

  findByToken(token) {
    let query = {
      device_token: token
    };

    return this.get({ query })
      .then(results => results[0]);
  }

}


export default DeviceUserModel;
