import ResourceModel from './resource-model';
import _ from 'lodash';

const ERR_CONDITION_FAILED = 'ConditionalCheckFailedException';

class UserModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  create(data) {
    data.id = data.identity_id.split(':').pop();
    return super.create(data);
  }

  update(username, data) {
    return super.update({ username }, data);
  }

  getByUsername(username) {
    let params = {
      TableName: this.tableName,
      Key: { username }
    };

    const func = (resolve, reject) => {
      this.dynamo.get(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result.Item);
      });
    };

    return new Promise(func);
  }

  getByUsernames(usernames) {
    // TODO support for more than 25 items
    let params = {
      RequestItems: {}
    };

    let getRequests = [];
    for (let username of usernames) {
      getRequests.push({ username });
    }

    params.RequestItems[this.tableName] = {};
    params.RequestItems[this.tableName].Keys = getRequests;

    const func = (resolve, reject) => {
      this.dynamo.batchGet(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        let failedSomeReads = _.values(result.UnprocessedItems).length > 0;
        if (failedSomeReads) {
          return reject(new Error('BatchReadFailed'));
        }

        resolve(result.Responses[this.tableName]);
      });
    };

    return new Promise(func);
  }

  addSpaceUsed(username, sizeInBytes) {
    let params = {
      TableName: this.tableName,
      Key: { username },
      ConditionExpression: 'space_used > :ZERO',
      UpdateExpression: 'set space_used = space_used + :space_used',
      ExpressionAttributeValues: {
        ':space_used': sizeInBytes,
        ':ZERO': 0
      },
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

    return new Promise(func)
      .catch(err => {
        if (err.code !== ERR_CONDITION_FAILED) {
          throw err;
        }

        console.info('Invalid space value. Setting up to zero');

        // setting value to zero
        params = {
          TableName: this.tableName,
          Key: { username },
          UpdateExpression: 'set space_used = :ZERO',
          ExpressionAttributeValues: {
            ':ZERO': 0
          },
          ReturnValues: 'ALL_NEW'
        };
        return new Promise(func);
      });
  }
}

export default UserModel;
