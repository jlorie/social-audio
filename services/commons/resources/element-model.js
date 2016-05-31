import ResourceModel from './resource-model';

class ElementModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  update(id, updateData) {
    return super.update({ id }, updateData);
  }

  getById(id) {
    let params = {
      TableName: this.tableName,
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

        resolve(result.Items[0]);
      });
    };

    return new Promise(func);
  }

  attachFile(elementId, attachmentData) {
    return this.getById(elementId)
      .then(element => {
        let audios = element.audios || [];
        audios.push(attachmentData);
        let key = {
          user_id: element.user_id,
          created_at: element.created_at
        };

        return this.update(key, { audios });
      });
  }
}

export default ElementModel;
