import AWS from 'aws-sdk';
import uuid from 'node-uuid';
import _ from 'lodash';

const DEFAULT_PAGE_LIMIT = 20;

class ResourceModel {
  constructor(apiUrl, region = 'us-east-1') {
    AWS.config.update({ region });

    this.dynamo = new AWS.DynamoDB.DocumentClient();
    this.tableName = apiUrl;
  }

  get({ query, limit, start }) {
    let pageSize = limit || DEFAULT_PAGE_LIMIT;

    let params = {
      TableName: this.tableName
    };

    // resolving expressions for query
    const { expressions, attrValues } = resolveExpression(query);
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
      Key: { id }
    };

    const func = (resolve, reject) => {
      this.dynamo.get(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    };

    return new Promise(func);
  }

  create(data) {
    data.id = uuid.v1();

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

  update(id, data) {
    const { expressions, attrValues } = resolveExpression(data);

    let params = {
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `set ${expressions.join(',')}`,
      ExpressionAttributeValues: attrValues,
      ReturnValues: 'ALL_NEW'
    };

    const func = (resolve, reject) => {
      this.dynamo.update(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    };

    return new Promise(func);
  }

  remove(id) {
    let params = {
      TableName: this.tableName,
      Key: { id }
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
}

function resolveExpression(data, parent) {
  // calculating prefix for expressions
  let prefix = '';
  if (parent) {
    prefix = `${parent}.`;
  }

  let expressions = [];
  let attrValues = {};
  for (let field in data) {
    if (_.isObject(data[field])) {
      // Getting expressions for inner object
      const innerExpressions = resolveExpression(data[field], field);
      expressions = _.concat(expressions, innerExpressions.expressions);
      attrValues = _.merge(attrValues, innerExpressions.attrValues);
    } else {
      expressions.push(`${prefix}${field} = :${prefix}${field}`);
      attrValues[`:${prefix}${field}`] = data[field];
    }
  }

  return { expressions, attrValues };
}

export default ResourceModel;
