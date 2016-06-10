import ResourceModel from './resource-model';

const MAX_NOTIFICATIONS_RESULTS = 20;

class NotificationModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  getByUserId({ userId, id, limit }) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
      },
      ScanIndexForward: false,
      Limit: limit || 0
    };

    if (id) {
      params.FilterExpression = 'id = :id';
      params.ExpressionAttributeValues[':id'] = id;
    }

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

  getPendingNotifications({ userId, elementId, limit }) {
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

    if (elementId) {
      params.FilterExpression += ' AND element_id = :element_id';
      params.ExpressionAttributeValues[':element_id'] = elementId;
    }

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

  getNotificationsFrom({ userId, date, limit = MAX_NOTIFICATIONS_RESULTS }) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id AND created_at > :created_at',
      ExpressionAttributeValues: {
        ':user_id': userId,
        ':created_at': date
      },
      ScanIndexForward: false,
      Limit: limit
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
