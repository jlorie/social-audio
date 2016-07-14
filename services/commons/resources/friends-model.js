import ResourceModel from './resource-model';

class FriendsModel extends ResourceModel {
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

}


export default FriendsModel;
