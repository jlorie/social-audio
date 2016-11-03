import ResourceModel from './resource-model';

class AnalyticsModel extends ResourceModel {

  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  findByDate(resource, startDate, endDate) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: '#resource = :resource ' +
        'and created_at between :start_date and :end_date',
      ExpressionAttributeNames: {
        '#resource': 'resource',
      },
      ExpressionAttributeValues: {
        ':resource': resource,
        ':start_date': startDate,
        ':end_date': endDate
      }
    };

    const promise = (resolve, reject) => {
      this.dynamo.query(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result.Items);
      });
    };

    return new Promise(promise);
  }
}

export default AnalyticsModel;
