import ResourceModel from './resource-model';

class NotificationModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  getByUserId(userId, limit) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
      },
      ScanIndexForward: false,
      Limit: limit || 0
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

  getPendingNotifications(userId, limit) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      FilterExpression: 'viewed = :viewed',
      ExpressionAttributeValues: {
        ':user_id': userId,
        ':viewed': false
      },
      ScanIndexForward: false,
      Limit: limit || 0
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

}


export default NotificationModel;
