import ResourceModel from './resource-model';

class ElementModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  get({ userId }) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
      },
      ProjectionExpression: 'id, created_at, thumbnail_url'
    };

    const func = (resolve, reject) => {
      this.dynamo.query(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        let result = {
          items: data.Items,
          next: data.LastEvaluatedKey
        };
        resolve(result);
      });
    };

    return new Promise(func);
  }
}

export default ElementModel;
