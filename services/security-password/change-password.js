import UserModel from '../commons/resources/user-model';
import { getEncryptedPassword } from '../commons/helpers/password-helper';
import { ERR_SECURITY } from '../commons/constants';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export function change(userId, oldPassword, newPassword) {
  console.info('Changing password for user ' + userId);
  return userModel.getById(userId)
    .then(user => {
      if (getEncryptedPassword(oldPassword) !== user.password) {
        throw new Error(ERR_SECURITY.INVALID_OLD_PASSWORD);
      }

      let password = getEncryptedPassword(newPassword);
      return userModel.update(user.username, { password })
        .then(() => ({ message: 'OK' }));
    });
}
