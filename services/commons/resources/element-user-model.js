import _ from 'lodash';
import ResourceModel from './resource-model';

const ID_INDEX_NAME = 'index-id';

class ElementUserModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  create(items) {
    return super.create(items);
  }

  update(elementId, userId, data) {
    return this.getById(elementId, userId)
      .then(references => {
        let reference = references[0];
        if (!reference) {
          throw new Error('InvalidReference');
        }

        let key = {
          user_id: reference.user_id,
          created_at: reference.created_at
        };

        return super.update(key, data);
      });
  }

  updateById(id, updateData) {
    return this.getById(id)
      .then(elements => {
        // update the element for every user

        let promises = Promise.all(elements.map(item => {
          let key = {
            user_id: item.user_id,
            created_at: item.created_at
          };

          return super.update(key, updateData);
        }));

        return promises;
      });
  }

  getById(id, userId) {
    let params = {
      TableName: this.tableName,
      IndexName: ID_INDEX_NAME,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id,
      }
    };

    if (userId) {
      params.KeyConditionExpression += ' AND user_id = :user_id';
      params.ExpressionAttributeValues[':user_id'] = userId;
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

  hasPermissions(elementId, userId) {
    return this.getById(elementId, userId)
      .then(references => {
        if (references.length > 0) {
          return true;
        }

        return false;
      });
  }

  getOldestPendingElements(userId, asOwner = false) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      FilterExpression: 'ref_status = :pending',
      ExpressionAttributeValues: {
        ':user_id': userId,
        ':pending': 'pending'
      }
    };

    const func = (resolve, reject) => {
      this.dynamo.query(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        let end = (asOwner ? 'owner' : 'visitor');
        resolve(result.Items.filter(i => i.created_at.endsWith(end)));
      });
    };

    return new Promise(func);
  }

}


export default ElementUserModel;
