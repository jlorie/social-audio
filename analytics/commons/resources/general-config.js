import ResourceModel from './resource-model';

const STAGE = process.env.SERVERLESS_STAGE;
const URI_SUFFIX = 'general-config';

class GeneralConfig extends ResourceModel {
  constructor(region = 'us-east-1', stage = STAGE) {
    let uri = `${stage}-${URI_SUFFIX}`;

    super(uri, region);
  }

  get(key) {
    let params = {
      TableName: this.tableName,
      Key: { key }
    };

    const func = (resolve, reject) => {
      this.dynamo.get(params, (err, result) => {
        if (err) {
          return reject(err);
        }

        if (!result.Item) {
          return reject(new Error('InvalidConfigKey'));
        }
        resolve(result.Item.value);
      });
    };

    return new Promise(func);
  }
}

export default GeneralConfig;
