import ResourceModel from './resource-model';
import { ERR_ELEMENTS } from '../constants';

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

  remove(id) {
    return super.remove({ id });
  }

  batchGet(ids) {
    return super.batchGet(ids.map(id => ({ id })));
  }

  batchRemove(ids) {
    return super.batchRemove(ids.map(id => ({ id })));
  }

  attachFile(id, attachmentData) {
    return this.getById(id)
      .then(element => {
        if (!element) {
          throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
        }

        let audios = element.audios || [];
        audios.push(attachmentData);

        return this.update(id, { audios });
      });
  }

  detachFile({ id, element, attachmentId }) {
    let elementPromise = element ? Promise.resolve(element) : this.getById(id);
    return elementPromise
      .then(element => {
        if (!element) {
          throw new Error('InvalidElement');
        }

        let audios = element.audios;
        let found = false;
        for (let i = 0; i < audios.length; ++i) {
          if (audios[i].id === attachmentId) {
            delete audios[i];
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error('InvalidAttachment');
        }

        return this.update(element.id, { audios });
      });
  }
}

export default ElementModel;
