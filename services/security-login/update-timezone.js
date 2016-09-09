import UserModel from '../commons/resources/user-model';
import { SUCCESS } from '../commons/constants';

const URI_USERS = process.env.URL_USERS_API;
const userModel = new UserModel(URI_USERS);

export default (username, offset) => {
  console.info(`Setting timezone offset ${offset} for ${username}`);

  return userModel.update(username, { timezone_offset: offset })
    .then(() => SUCCESS);
};
