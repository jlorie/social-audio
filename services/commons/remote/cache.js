'use strict';

const AWS = require('aws-sdk');
const config = require('../config');

const SDB_CACHE_ITEM = 'bbluue-cache';

AWS.config.update({ region: config.AWS_REGION });
const simpledb = new AWS.SimpleDB();

const ERROR_ATTRIBUTE_NOT_EXIST = 'AttributeDoesNotExist';
const ERROR_CACHE_CONDITIONAL_CHECK = 'ConditionalCheckFailed';

class Cache {
  constructor(dbName) {
    this.dbName = dbName;
  }

  set(key, value, expectedValue, callback) {
    let params = {
      Attributes: [ {
          Name: key,
          Value: value,
          Replace: true
        }
      ],
      DomainName: this.dbName,
      ItemName: SDB_CACHE_ITEM,
    };

    if (expectedValue) {
      console.log('Setting conditional value ...');
      params.Expected = {
        Exists: true,
        Name: key,
        Value: expectedValue
      };
    }

    simpledb.putAttributes(params, (err, response) => {
      if (err) {
        //If the attribute does not exist then a method call is made with
        //the appropiate settings
        if (err.code && err.code === ERROR_ATTRIBUTE_NOT_EXIST) {
          return this.set(key, value, null, callback);
        }

        if (err.code && err.code === ERROR_CACHE_CONDITIONAL_CHECK) {
          return callback(null, false);
        }


        console.error('An error has occurred while setting value for key: ' +
          key + ', ' + err);

        return callback(err);
      }

      callback(null, true);
    });
  }

  get(key, callback) {
    var params = {
      DomainName: this.dbName,
      ItemName: SDB_CACHE_ITEM,
      AttributeNames: [key],
      ConsistentRead: true
    };

    simpledb.getAttributes(params, (err, result) => {
      if (err) {
        console.error('An error has occurred getting value for key: ' + key +
          ', ' + err);

        return callback(err);
      }

      let value;
      if (result.Attributes) {
        value = result.Attributes[0].Value;
      }

      callback(null, value);
    });
  }
}

module.exports = Cache;
