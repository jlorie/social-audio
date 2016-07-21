import ResourceModel from './resource-model';

const INDEX_ID_NAME = 'index-id';

class FriendsModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  getById(friendId) {
    let params = {
      TableName: this.tableName,
      IndexName: INDEX_ID_NAME,
      KeyConditionExpression: 'friend_id = :friend_id',
      ExpressionAttributeValues: {
        ':friend_id': friendId,
      }
    };

    const func = (resolve, reject) => {
      this.dynamo.query(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result.Items);
      });
    };

    return new Promise(func);
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
