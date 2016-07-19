import AWS from 'aws-sdk';
AWS.config.update({ region: 'us-east-1' });
const dynamo = new AWS.DynamoDB.DocumentClient();

function update(key, data) {
  const { expressions, attrValues } = resolveUpdateExpression(data);

  let params = {
    TableName: 'dev-elements-by-users',
    Key: key,
    UpdateExpression: `set ${expressions.join(',')}`,
    ExpressionAttributeValues: attrValues,
    ReturnValues: 'ALL_NEW'
  };

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

function resolveUpdateExpression(data) {
  let expressions = [];
  let attrValues = {};
  for (let field in data) {
    let attrName = `${field}`.replace(/\W/g, '');
    expressions.push(`${field} = :${attrName}`);
    attrValues[`:${attrName}`] = data[field];
  }

  return { expressions, attrValues };
}


export default () => {
  let key = {
    user_id: '07484310-0a1a-48e0-b9c7-28257150f04a',
    created_at: '2016-07-06T20:31:34.300Z|owner'
  };

  let data = {
    audios: {
      '07484310-0a1a-48e0-b9c7-28257150f04a': 3,
      'a12-333333-44444': 1
    }
  };

  return update(key, data).then(() => 'OK');
};
