import ResourceModel from './resource-model';

class UserModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  getByUsername(username) {
    let params = {
      TableName: this.tableName,
      Key: { username }
    };

    const func = (resolve, reject) => {
      this.dynamo.get(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result.Item);
      });
    };

    return new Promise(func);
  }

}

export default UserModel;
