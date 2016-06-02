import ResourceModel from './resource-model';
import _ from 'lodash';

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

  remove(ids) {
    if (_.isArray(ids)) {
      let requests = this._resolveDeleteRequests(ids.map(id => ({ id })));
      return this._batchWrite(requests);
    }

    return super.remove({ ids });
  }

  attachFile(id, attachmentData) {
    return this.getById(id)
      .then(element => {
        let audios = element.audios || [];
        audios.push(attachmentData);

        return this.update(id, { audios });
      });
  }

}

export default ElementModel;
