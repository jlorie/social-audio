import moment from 'moment';
import ResourceModel from './resource-model';

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

  remove(username) {
    return super.remove({ username });
  }

  removeById(id) {
    return this.getById(id)
      .then(user => {
        if (!user) {
          throw new Error('InvalidId');
        }

        return super.remove({ username: user.username });
      });
  }

  batchGet(usernames) {
    return super.batchGet(usernames.map(username => ({ username })));
  }

  batchGetByIds(ids) {
    return Promise.all(ids.map(id => this.getById(id)));
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

  addSpaceUsed(username, sizeInBytes) {
    let params = {
      TableName: this.tableName,
      Key: { username },
      ConditionExpression: 'space_used >= :ZERO',
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

  expiredUsers(days) {
    let expirationDate = moment().subtract(days, 'days').utc().format('YYYY-MM-DD');

    let params = {
      TableName: this.tableName,
      FilterExpression: 'user_status = :user_status and created_at <= :expiration_date',
      ExpressionAttributeValues: {
        ':user_status': 'disabled',
        ':expiration_date': expirationDate
      }
    };

    return this._scan(params);
  }

  inactiveUsers(days) {
    let inactiveDate = moment().subtract(days, 'days').utc().format('YYYY-MM-DD');

    let params = {
      TableName: this.tableName,
      FilterExpression: 'user_status = :user_status and created_at <= :inactive_date',
      ExpressionAttributeValues: {
        ':user_status': 'idle',
        ':inactive_date': inactiveDate
      }
    };

    return this._scan(params);
  }

}

export default UserModel;
