import ResourceModel from './resource-model';

const MAX_LOG_RESULTS = 20;

class UserLogModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  log({ userId, userAction }) {
    let data = {
      user_id: userId,
      created_at: new Date().toISOString(),
      user_action: userAction
    };

    return this.create(data);
  }

  get({ userId, action, limit = MAX_LOG_RESULTS }) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
      },
      ScanIndexForward: false,
      Limit: limit
    };

    if (action) {
      params.FilterExpression = 'user_action = :user_action';
      params.ExpressionAttributeValues[':user_action'] = action;
    }

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


export default UserLogModel;
