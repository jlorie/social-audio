import AWS from 'aws-sdk';
import uuid from 'node-uuid';
import _ from 'lodash';

const DEFAULT_PAGE_LIMIT = 20;
const INDEX_ID_NAME = 'index-id';

class ResourceModel {
  constructor(tableName, region = 'us-east-1') {
    AWS.config.update({ region });

    this.dynamo = new AWS.DynamoDB.DocumentClient();
    this.tableName = tableName;
  }

  get({ query, limit, start }) {
    let pageSize = limit || DEFAULT_PAGE_LIMIT;

    let params = {
      TableName: this.tableName
    };

    // resolving expressions for query
    const { expressions, attrValues } = this._resolveExpression(query);
    if (expressions.length) {
      params.FilterExpression = expressions.join(',');
      params.ExpressionAttributeValues = attrValues;
    }

    if (start) {
      params.ExclusiveStartKey = {
        id: start
      };
    }

    const func = (resolve, reject) => {
      let results = [];
      let dynamo = this.dynamo;
      dynamo.scan(params, onScan);

      function onScan(err, data) {
        if (err) {
          return reject(err);
        }

        results = _.concat(results, data.Items);

        // continue scanning if we have more items to find
        if (data.LastEvaluatedKey && results.length < pageSize) {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          dynamo.scan(params, onScan);
        } else {
          resolve(results.slice(0, pageSize));
        }
      }
    };

    return new Promise(func);
  }

  getById(id) {
    let params = {
      TableName: this.tableName,
      IndexName: INDEX_ID_NAME,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id,
      }
    };

    const func = (resolve, reject) => {
      this.dynamo.query(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result.Items[0]);
      });
    };

    return new Promise(func);
  }

  create(data) {
    if (!data.id) {
      data.id = uuid.v1();
    }

    const func = (resolve, reject) => {
      let params = {
        TableName: this.tableName,
        Item: data
      };

      this.dynamo.put(params, err => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    };

    return new Promise(func);
  }

  update(key, data) {
    const { expressions, attrValues } = this._resolveExpression(data);

    let params = {
      TableName: this.tableName,
      Key: key,
      UpdateExpression: `set ${expressions.join(',')}`,
      ExpressionAttributeValues: attrValues,
      ReturnValues: 'ALL_NEW'
    };

    const func = (resolve, reject) => {
      this.dynamo.update(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data.Attributes);
      });
    };

    return new Promise(func);
  }

  remove(key) {
    let params = {
      TableName: this.tableName,
      Key: key
    };

    const func = (resolve, reject) => {
      this.dynamo.delete(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    };

    return new Promise(func);
  }

  batchCreate(items) {
    let putRequests = this._resolvePutRequests(items);
    return this._batchWrite(putRequests);
  }

  batchRemove(keys) {
    let deleteRequests = this._resolveDeleteRequests(keys);
    return this._batchWrite(deleteRequests);
  }

  batchGet(keys) {
    return this._batchGet(keys);
  }

  _batchWrite(requests) {
    // batch write
    // TODO support for more than 25 items
    let params = {
      RequestItems: {
        [this.tableName]: requests
      }
    };

    let promise = (resolve, reject) => {
      this.dynamo.batchWrite(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        let failedSomeWrites = _.values(data.UnprocessedItems).length > 0;
        if (failedSomeWrites) {
          return reject(new Error('BatchWriteFailed'));
        }

        resolve('success');
      });
    };

    return new Promise(promise);
  }

  _batchGet(requests) {
    // batch write
    // TODO support for more than 25 items
    let params = {
      RequestItems: {
        [this.tableName]: {
          Keys: requests
        }
      }
    };

    let promise = (resolve, reject) => {
      this.dynamo.batchGet(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        let failedSomeWrites = _.values(data.UnprocessedItems).length > 0;
        if (failedSomeWrites) {
          return reject(new Error('BatchWriteFailed'));
        }

        resolve(data.Responses[this.tableName]);
      });
    };

    return new Promise(promise);
  }

  _resolveExpression(data, parent) {
    // calculating prefix for expressions
    let prefix = '';
    if (parent) {
      prefix = `${parent}.`;
    }

    let expressions = [];
    let attrValues = {};
    for (let field in data) {
      if (_.isPlainObject(data[field])) {
        // Getting expressions for inner object
        const innerExpressions = this._resolveExpression(data[field], field);
        expressions = _.concat(expressions, innerExpressions.expressions);
        attrValues = _.merge(attrValues, innerExpressions.attrValues);
      } else {
        expressions.push(`${prefix}${field} = :${prefix}${field}`);
        attrValues[`:${prefix}${field}`] = data[field];
      }
    }

    return { expressions, attrValues };
  }

  _resolveDeleteRequests(keys) {
    let deleteRequests = [];
    for (let key of keys) {
      let request = {
        DeleteRequest: {
          Key: key
        }
      };

      deleteRequests.push(request);
    }

    return deleteRequests;
  }

  _resolvePutRequests(items) {
    let putRequests = [];
    for (let item of items) {
      let request = {
        PutRequest: {
          Item: item
        }
      };

      putRequests.push(request);
    }

    return putRequests;
  }
}

export default ResourceModel;
