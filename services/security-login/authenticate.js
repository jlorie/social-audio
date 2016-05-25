import RemoteModel from '../commons/resources/resource-model';
import { getEncryptedPassword } from '../commons/helpers/password-helper';
import CredentialProvider from '../commons/remote/credentials-provider';

const URL_USERS_API = process.env.URL_USERS_API;
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
const IDENTITY_ROLE_ARN = process.env.IDENTITY_ROLE_ARN;

const userModel = new RemoteModel(URL_USERS_API);
const provider = new CredentialProvider({
  identityPoolId: IDENTITY_POOL_ID,
  identityRoleArn: IDENTITY_ROLE_ARN
});

export function authenticate({ username, password }) {
  console.info('Authenticating user ' + username);

  return userModel.get({ username })
    .then(users => verify(users[0], password))
    .then(getCredentials)
    .catch(err => {
      console.error('An error occurred authenticating user ' + username + '. ' + err);
      throw err;
    });
}

function verify(user, password) {
  console.info('Verifying password ...');
  if (!user) {
    throw new Error('InvalidUser');
  }

  if (getEncryptedPassword(password) !== user.password) {
    throw new Error('InvalidPassword');
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
      credentials.userId = user._id;
      credentials.userStatus = user.status;

      return credentials;
    });
}
