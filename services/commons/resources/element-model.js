import ResourceModel from './resource-model';
import _ from 'lodash';

class ElementModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  get({ userId, filters, attributes }) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
      },
      ScanIndexForward: false
    };

    // getting only attributes requested
    if (attributes) {
      params.ProjectionExpression = attributes;
    }

    // resolving expressions for query
    const { expressions, attrValues } = this._resolveExpression(filters);
    if (expressions.length) {
      params.FilterExpression = expressions.join(',');
      params.ExpressionAttributeValues = _.merge(attrValues, params.ExpressionAttributeValues);
    }

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

  attachFile(elementId, attachmentData) {
    return this.getById(elementId)
      .then(element => {
        let audios = element.audios || [];
        audios.push(attachmentData);
        let key = {
          user_id: element.user_id,
          created_at: element.created_at
        };

        return this.update(key, { audios });
      });
  }
}

export default ElementModel;
