import AWS from 'aws-sdk';
import _ from 'lodash';

const MAX_ITEMS_BATCH = 25;
const DEFAULT_PAGE_LIMIT = Number.MAX_VALUE;

class ResourceModel {
  constructor(tableName, region = 'us-east-1') {
    AWS.config.update({ region });

    this.dynamo = new AWS.DynamoDB.DocumentClient();
    this.tableName = tableName;
  }

  get(query = {}, limit, start) {
    let pageSize = limit || DEFAULT_PAGE_LIMIT;

    let params = {
      TableName: this.tableName
    };

    // resolving expressions for query
    const { expressions, attrValues } = this._resolveExpression(query);
    if (expressions.length) {
      params.FilterExpression = expressions.join(' and ');
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

  create(data) {
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

  update(key, data, attrToRemove) {
    const { expressions, attrValues } = this._resolveUpdateExpression(data);

    let params = {
      TableName: this.tableName,
      Key: key,
      UpdateExpression: `set ${expressions.join(',')}`,
      ExpressionAttributeValues: attrValues,
      ReturnValues: 'ALL_NEW'
    };

    if (attrToRemove) {
      params.UpdateExpression += ` remove ${attrToRemove.join(',')}`;
    }

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
    // Execute batch requests in chunks of 25 items
    let chunks = _.chunk(items, MAX_ITEMS_BATCH);
    let putRequests = chunks.map(this._resolvePutRequests);

    return Promise.all(putRequests.map(this._batchWrite, this))
      .then(() => items);
  }

  batchRemove(items) {
    // Execute batch requests in chunks of 25 items
    let chunks = _.chunk(items, MAX_ITEMS_BATCH);
    let deleteRequests = chunks.map(this._resolveDeleteRequests);

    return Promise.all(deleteRequests.map(this._batchWrite, this));
  }

  batchGet(items) {
    // Execute batch requests in chunks of 25 items
    let chunks = _.chunk(items, MAX_ITEMS_BATCH);
    return Promise.all(chunks.map(this._batchGet, this))
      .then(results => _.flattenDeep(results));
  }

  _scan(params) {
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
        if (data.LastEvaluatedKey) {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          dynamo.scan(params, onScan);
        } else {
          resolve(results);
        }
      }
    };

    return new Promise(func);
  }

  _batchWrite(requests) {
    // batch write
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
    let params = {
      RequestItems: {
        [this.tableName]: {
          Keys: requests
        }
      }
    };

    console.log('==> params: ', JSON.stringify(params, null, 2));
    let promise = (resolve, reject) => {
      this.dynamo.batchGet(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        let failedSomeWrites = _.values(data.UnprocessedItems).length > 0;
        if (failedSomeWrites) {
          return reject(new Error('BatchGetFailed'));
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
        let attrName = `${prefix}${field}`.replace(/\W/g, '');
        expressions.push(`${prefix}${field} = :${attrName}`);
        attrValues[`:${attrName}`] = data[field];
      }
    }

    return { expressions, attrValues };
  }

  _resolveUpdateExpression(data) {
    let expressions = [];
    let attrValues = {};
    for (let field in data) {
      let attrName = `${field}`.replace(/\W/g, '');
      expressions.push(`${field} = :${attrName}`);
      attrValues[`:${attrName}`] = data[field];
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
