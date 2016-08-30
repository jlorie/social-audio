const AWS = require('aws-sdk');

class FunctionInvoker {
  constructor(uri, stage = 'dev', region = 'us-east-1') {
    AWS.config.update({ region });

    this.functionName = `${uri}:${stage}`;
    this.lambda = new AWS.Lambda();
  }

  invoke({ body = '{}', type = INVOKE_TYPE.RequestResponse }) {
    let params = {
      FunctionName: this.functionName,
      InvocationType: type,
      Payload: body
    };

    let promise = (resolve, reject) => {
      this.lambda.invoke(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    };

    return new Promise(promise);
  }

}

export default FunctionInvoker;

export const INVOKE_TYPE = {
  RequestResponse: 'RequestResponse',
  Event: 'Event'
};
