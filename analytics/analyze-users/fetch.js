import ResourceModel from '../commons/resources/resource-model';

const URI_USERS = process.env.URI_USERS;
const SERVERLESS_REGION = process.env.SERVERLESS_REGION;

const userModel = new ResourceModel(URI_USERS, SERVERLESS_REGION);

// fetch
export default () => {
  console.info('Getting users ...');
  return userModel.get();
};
