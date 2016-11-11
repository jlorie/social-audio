import ResourceModel from './resource-model';

class AudioModel extends ResourceModel {
  constructor(uri, region = 'us-east-1') {
    super(uri, region);
  }

  updatePlaybacks(elementId, audioPlaybacks) {
    return this._getElementById(elementId)
      .then(element => {
        if (!element) {
          throw new Error('InvalidElement');
        }

        let isEmpty = element.audios.length === 0;
        if (isEmpty) {
          return 'NothingToDo';
        }

        return this._updateAudioCount(elementId, audioPlaybacks, element.audios);
      });
  }

  _getElementById(elementId) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': elementId,
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

  _updateAudioCount(elementId, audioPlaybacks, elementAudios) {
    let params = this._resolveUpdateParams(elementId, audioPlaybacks, elementAudios);

    let promise = (resolve, reject) => {
      this.dynamo.update(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        return resolve(result);
      });
    };

    return new Promise(promise);
  }

  _resolveUpdateParams(elementId, audioPlaybacks, elementAudios) {
    let expressions = [];
    let attrValues = {};
    let conditions = [];
    for (let i = 0; i < audioPlaybacks.length; i++) {
      let playInfo = audioPlaybacks[i];
      let index = elementAudios.findIndex(audio => audio.id === playInfo.id);

      if (index >= 0) {
        // increment statement
        const playsAttrName = `:playbacks_${i}`;
        attrValues[playsAttrName] = playInfo.playbacks;
        expressions.push(`audios[${index}].playbacks ${playsAttrName}`);

        // condition audio id most be equal to audioPlayback id
        const idAttrName = `:audio_id_${i}`;
        attrValues[idAttrName] = playInfo.id;
        conditions.push(`audios[${index}].id = ${idAttrName}`);
      }
    }

    const params = {
      TableName: this.tableName,
      Key: { id: elementId },
      ConditionExpression: conditions.join(' and '),
      UpdateExpression: `add ${expressions.join(', ')}`,
      ExpressionAttributeValues: attrValues,
      ReturnValues: 'ALL_NEW'
    };

    return params;
  }
}

export default AudioModel;
