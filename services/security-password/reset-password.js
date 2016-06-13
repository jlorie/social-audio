import jwt from 'jsonwebtoken';
import UserModel from '../commons/resources/user-model';
import { getEncryptedPassword } from '../commons/helpers/password-helper';

const URI_USERS = process.env.URI_USERS;
const PREFIX_SECRET = 'bbluue-';
const RESPONSE_SUCCESS = { status: 'OK' };
const STATUS_DISABLED = 'disabled';

const userModel = new UserModel(URI_USERS);

export function reset({ email, password, token }) {
  console.info('Resetting password for user with email ' + email);

  return isValid(email, token)
    .then(valid => {
      if (!valid) {
        throw new Error('InvalidToken');
      }

      return changePassword(email, password);
    })
    .catch(err => {
      console.info('An error occurred changing password for user with email ' +
        email + '. ' + err);
      throw err;
    });
}

function isValid(email, token) {
  console.info('Verifying token for email: ', email);
  let secret = PREFIX_SECRET + email;

  let result = resolve => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        console.info('An error occurred validating token. ' + err);
        return resolve(false);
      }

      let valid = decoded && decoded.email === email;
      resolve(valid);
    });
  };

  return new Promise(result);
}

function changePassword(email, password) {
  console.info('Changing password for user with email ' + email);
  return userModel.getByUsername(email)
    .then(user => {
      if (!user) {
        throw new Error('InvalidUser');
      }

      if (user.status === STATUS_DISABLED) {
        throw new Error('AccountDisabled');
      }

      console.info('Updating password user ' + user.id);
      let encriptedPassword = getEncryptedPassword(password);
      return userModel.update(email, { password: encriptedPassword })
        .then(() => RESPONSE_SUCCESS);
    });
}
