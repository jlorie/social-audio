import CredentialProvider from '../commons/remote/credentials-provider';
import RemoteModel from '../commons/resources/resource-model';

import { getEncryptedPassword } from '../commons/helpers/password-helper';

const URL_USERS_API = process.env.URL_USERS_API;
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
const IDENTITY_ROLE_ARN = process.env.IDENTITY_ROLE_ARN;

const provider = new CredentialProvider({
  identityPoolId: IDENTITY_POOL_ID,
  identityRoleArn: IDENTITY_ROLE_ARN
});

const userModel = new RemoteModel(URL_USERS_API);

export default function register({ username, password, fullname, genre, birthdate }) {
  console.info('Getting user identity');
  return provider.getUserIdentity()
    .then(identityId => {
      let user = {
        username,
        fullname,
        genre,
        birthdate: new Date(birthdate),
        password: getEncryptedPassword(password),
        identity_id: identityId
      };

      console.info('Creating a new user with params: ', JSON.stringify(user, null, 2));
      return userModel.create(user);
    })
    .catch(err => {
      console.error('An error occurred registering username ' + username + '. ' + err);
      throw err;
    });
}
