import UserModel from '../commons/resources/user-model';
import jwt from 'jsonwebtoken';

const URI_USERS = process.env.URI_USERS;
const URL_EMAIL_UNSUBSCRIBE_SUCCESS = process.env.URL_EMAIL_UNSUBSCRIBE_SUCCESS;
const URL_EMAIL_UNSUBSCRIBE_FAIL = process.env.URL_EMAIL_UNSUBSCRIBE_FAIL;

const STATUS_UNSUBSCRIBED = 'unsubscribed';
const PREFIX_SECRET = 'bbluue-';
const userModel = new UserModel(URI_USERS);

const RESPONSE_SUCCESS = { location: URL_EMAIL_UNSUBSCRIBE_SUCCESS };
const RESPONSE_FAIL = { location: URL_EMAIL_UNSUBSCRIBE_FAIL };

export function unsubscribe({ email, token }) {
  console.info('Unsubscring email ' + email);

  return isValid(email, token)
    .then(valid => {
      if (!valid) {
        return RESPONSE_FAIL;
      }

      return updateUser(email)
        .then(() => RESPONSE_SUCCESS);
    })
    .catch(err => {
      console.info('An error occurred changing password for user with email ' + email + '. ' + err);
      return RESPONSE_FAIL;
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

function updateUser(email) {
  console.info('Updating email status for user with email ' + email);
  return userModel.update(email, { email_status: STATUS_UNSUBSCRIBED });
}
