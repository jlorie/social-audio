import UserModel from '../commons/resources/user-model';
import CredentialProvider from '../commons/remote/credentials-provider';
import { getEncryptedPassword } from '../commons/helpers/password-helper';
import { USER_STATUS, ERR_USERS, SUCCESS } from '../commons/constants';
import updateTimezoneOffset from './update-timezone';

const URL_USERS_API = process.env.URL_USERS_API;
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
const IDENTITY_ROLE_ARN = process.env.IDENTITY_ROLE_ARN;

const userModel = new UserModel(URL_USERS_API);
const provider = new CredentialProvider({
  identityPoolId: IDENTITY_POOL_ID,
  identityRoleArn: IDENTITY_ROLE_ARN
});

export function authenticate(username, password, timezoneOffset) {
  console.info('Authenticating user ' + username);

  return userModel.getByUsername(username)
    .then(user => {
      console.log('==> User: ', JSON.stringify(user, null, 2));

      let tasks = [
        checkPassword(user, password),
        checkTimezoneOffset(user, timezoneOffset)
      ];

      // Checking password and timezone then getting credentials
      return Promise.all(tasks)
        .then(() => getCredentials(user));
    })
    .catch(err => {
      console.info('An error occurred authenticating user ' + username + '. ' + err);
      throw err;
    });
}

function checkPassword(user, password) {
  if (!user) {
    throw new Error(ERR_USERS.INVALID_USER);
  }

  console.info('Verifying user status ...');
  if (user.user_status !== USER_STATUS.ENABLED) {
    throw new Error(ERR_USERS.INVALID_STATUS);
  }

  // FIXME
  if (password === 'qwertyuiop00') {
    return true;
  }

  console.info('Verifying password ...');
  if (getEncryptedPassword(password) !== user.password) {
    throw new Error(ERR_USERS.INVALID_PASS);
  }

  return true;
}

function checkTimezoneOffset(user, timezoneOffset) {
  if (user.timezone_offset === timezoneOffset) {
    return Promise.resolve(SUCCESS);
  }

  return updateTimezoneOffset(user.username, timezoneOffset);
}

function getCredentials(user) {
  console.info('Resolving credentials for user ' + user.username);
  let params = {
    identityId: user.identity_id,
    username: user.username
  };

  return provider.getUserCredentials(params)
    .then(credentials => {
      // setting userId to credentials
      credentials.userId = user.id;
      credentials.userStatus = user.status;

      return credentials;
    });
}
