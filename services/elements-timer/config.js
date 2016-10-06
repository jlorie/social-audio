import GeneralConfig from '../commons/resources/general-config';

const STAGE = process.env.SERVERLESS_STAGE;
const REGION = process.env.SERVERLESS_REGION;

const config = new GeneralConfig(REGION, STAGE);
let cache = new Map();

// config
export default (key) => {
  let cachedValue = cache.get(key);
  if (cachedValue) {
    return Promise.resolve(cachedValue);
  }

  return config.get(key).then(value => {
    if (value) {
      cache.set(key, value);
    }

    return value;
  });
};
