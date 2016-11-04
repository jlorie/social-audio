import GeneralConfig from '../commons/resources/general-config';

const STAGE = process.env.SERVERLESS_STAGE;
const REGION = process.env.SERVERLESS_REGION;

const config = new GeneralConfig(REGION, STAGE);
let cache = new Map();

export default (event, context) => {
  let input = event;
  input.stage = STAGE;
  console.info('==> Input: ', JSON.stringify(input, null, 2));

  return resolveValue(event.param)
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);
      let error = {
        status: 'ERROR',
        message: err.message
      };

      context.fail(JSON.stringify(error));
    });
};

const CLIENT_PARAMS_KEY = 'client_params';

function resolveValue(key) {
  return resolveParams()
    .then(params => {
      if (!key) {
        return params;
      }

      let output = {
        value: params[key]
      };

      return output;
    });
}

function resolveParams() {
  let cachedValue = cache.get(CLIENT_PARAMS_KEY);
  if (cachedValue) {
    return Promise.resolve(cachedValue);
  }

  return config.get(CLIENT_PARAMS_KEY)
    .then(value => {
      if (value) {
        cache.set(CLIENT_PARAMS_KEY, value);
      }

      return value;
    });
}
