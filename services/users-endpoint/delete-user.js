import UserModel from '../commons/resources/user-model';
import { SUCCESS } from '../commons/constants';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export function deleteUser(userId) {
  console.info('Deleting user with id ' + userId);
  return userModel.removeById(userId)
    .then(() => SUCCESS);
}
