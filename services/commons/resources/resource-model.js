import AWS from 'aws-sdk';
import dynamoDoc from 'dynamo-doc';
import uuid from 'node-uuid';
import _ from 'lodash';

class ResourceModel {
  constructor(apiUrl, region = 'us-east-1') {
    AWS.config.region = region;

    this.dynamo = new AWS.DynamoDB();
    this.tableName = apiUrl;
  }

  get(query) {}

  getById(id) {}

  create(data) {
    data.id = uuid.v1();

    let func = (resolve, reject) => {
      // Get dynamo format
      resolveDynamoFormat(data, (err, dynamoData) => {
        let params = {
          TableName: this.tableName,
          Item: dynamoData
        };

        this.dynamo.putItem(params, err => {
          if (err) {
            return reject(err);
          }

          resolve(data);
        });
      });
    };

    return new Promise(func);
  }

  update(id, data) {}

  remove(id) {}
}

function resolveDynamoFormat(data, callback) {
  let result = data;
  for (let field in result) {
    let value = result[field];

    if (_.isDate(value)) {
      result[field] = value.getTime();
    }
  }

  dynamoDoc.jsToDynamo(result, (err, dynamoData) => {
    if (err) {
      return callback(err);
    }

    callback(null, dynamoData);
  })
}

export default ResourceModel;
