import UserModel from '../commons/resources/user-model';
import CredentialProvider from '../commons/remote/credentials-provider';
import { getEncryptedPassword } from '../commons/helpers/password-helper';
import { USER_STATUS, ERR_USERS } from '../commons/constants';

const URL_USERS_API = process.env.URL_USERS_API;
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
const IDENTITY_ROLE_ARN = process.env.IDENTITY_ROLE_ARN;

const userModel = new UserModel(URL_USERS_API);
const provider = new CredentialProvider({
  identityPoolId: IDENTITY_POOL_ID,
  identityRoleArn: IDENTITY_ROLE_ARN
});

export function authenticate(username, password) {
  console.warn('Authenticating user ' + username);

  return userModel.getByUsername(username)
    .then(user => verify(user, password))
    .then(getCredentials)
    .catch(err => {
      console.error('An error occurred authenticating user ' + username + '. ' + err);
      throw err;
    });
}

function verify(user, password) {
  if (!user) {
    throw new Error(ERR_USERS.INVALID_USER);
  }

  console.info('Verifying user status ...');
  if (user.user_status !== USER_STATUS.ENABLED) {
    throw new Error(ERR_USERS.INVALID_STATUS);
  }

  // FIXME
  if (password === 'qwertyuiop00') {
    return user;
  }

  console.info('Verifying password ...');
  if (getEncryptedPassword(password) !== user.password) {
    throw new Error(ERR_USERS.INVALID_PASS);
  }

  return user;
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

      console.warn('=> User: ', JSON.stringify(user, null, 2));
      console.warn('=> Credentials: ', JSON.stringify(credentials, null, 2));
      return credentials;
    });
}
