import ResourceModel from './resource-model';

class ReferenceModel extends ResourceModel {

  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  findByDay(date) {
    let params = {
      TableName: this.tableName,
      FilterExpression: 'begins_with(created_at, :date)',
      ExpressionAttributeValues: {
        ':date': date
      }
    };

    return this._scan(params);
  }
}

export default ReferenceModel;
