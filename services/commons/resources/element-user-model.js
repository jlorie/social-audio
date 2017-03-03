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

  rawUpdate(key, data, attrToRemove) {
    return super.update(key, data, attrToRemove);
  }

  update(elementId, userId, data, attrToRemove) {
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

        return super.update(key, data, attrToRemove);
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

  list(userId) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      FilterExpression: 'ref_status = :resolved or ref_status = :idle',
      ExpressionAttributeValues: {
        ':user_id': userId,
        ':resolved': 'resolved',
        ':idle': 'idle'
      },
      ScanIndexForward: false
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
        ':user_id': userId
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

  listExpiring(userId) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      FilterExpression: 'attribute_exists(expire_at)',
      ExpressionAttributeValues: {
        ':user_id': userId,
      },
      ScanIndexForward: false
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

  getOldestElements(userId, status) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
      }
    };

    if (status) {
      params.FilterExpression = 'ref_status = :status';
      params.ExpressionAttributeValues[':status'] = status;
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

}


export default ElementUserModel;
