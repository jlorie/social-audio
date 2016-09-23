import AWS from 'aws-sdk';
import NotificationModel from '../commons/resources/notification-model';

const notificationModel = new NotificationModel('dev-notifications');
export default () => {
  let key = {
    user_id: '07484310-0a1a-48e0-b9c7-28257150f04a',
    created_at: '2016-07-29T20:44:46.597Z|visitor'
  };

  return update(key, { favorite: false }, ['test1', 'test2']);
};

const dynamo = new AWS.DynamoDB.DocumentClient();

function update(key, data, attrToRemove) {
  const { expressions, attrValues } = _resolveUpdateExpression(data);

  let params = {
    TableName: 'dev-elements-by-users',
    Key: key,
    UpdateExpression: `set ${expressions.join(',')}`,
    ExpressionAttributeValues: attrValues,
    ReturnValues: 'ALL_NEW'
  };

  if (attrToRemove) {
    params.UpdateExpression += ` remove ${attrToRemove.join(',')}`;
  }

  console.log('==> params: ', JSON.stringify(params, null, 2));
  const func = (resolve, reject) => {
    dynamo.update(params, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data.Attributes);
    });
  };

  return new Promise(func);
}

function _resolveUpdateExpression(data) {
  let expressions = [];
  let attrValues = {};
  for (let field in data) {
    let attrName = `${field}`.replace(/\W/g, '');
    expressions.push(`${field} = :${attrName}`);
    attrValues[`:${attrName}`] = data[field];
  }

  return { expressions, attrValues };
}
