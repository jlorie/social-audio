import jwt from 'jsonwebtoken';
import config from './config';
import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const RESPONSE_SUCCESS = { location: config.URL_EMAIL_VERIFY_SUCCESS };
const RESPONSE_FAIL = { location: config.URL_EMAIL_VERIFY_FAIL };

const userModel = new UserModel(URI_USERS);

export function validate({ email, token }) {
  console.info('Validating activation request for email ' + email);

  return isValid(email, token)
    .then(valid => {
      if (valid) {
        return activateAccount(email)
          .then(() => RESPONSE_SUCCESS);
      }

      return RESPONSE_FAIL;
    })
    .catch(err => {
      console.info('An error occurred confirming email ' + email + '. ' + err);
      return RESPONSE_FAIL;
    });
}

function isValid(email, token) {
  console.info('Verifying token for email: ', email);
  let secret = 'bbluue-' + email;

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

function activateAccount(email) {
  console.info('Activating user with email ' + email);
  return userModel.update(email, { user_status: 'enabled' });
}
