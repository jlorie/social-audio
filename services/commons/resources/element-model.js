import ResourceModel from './resource-model';

class ElementModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
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

        data.id = data.user_id + '|' + data.created_at;
        resolve(data);
      });
    };

    return new Promise(func);
  }

}

export default ElementModel;
