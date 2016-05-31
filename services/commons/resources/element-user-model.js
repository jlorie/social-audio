import ResourceModel from './resource-model';

const ID_USER_INDEX_NAME = 'index-id';

class ElementUserModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  update(id, updateData) {
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

  getById(id) {
    let params = {
      TableName: this.tableName,
      IndexName: ID_USER_INDEX_NAME,
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

        resolve(result.Items);
      });
    };

    return new Promise(func);
  }
}

export default ElementUserModel;
