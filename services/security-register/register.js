import CredentialProvider from '../commons/remote/credentials-provider';
import UserModel from '../commons/resources/user-model';

import { getEncryptedPassword } from '../commons/helpers/password-helper';

const ACCOUNT_TYPE_BASIC = 'basic';
const URL_USERS_API = process.env.URL_USERS_API;
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
const IDENTITY_ROLE_ARN = process.env.IDENTITY_ROLE_ARN;

const provider = new CredentialProvider({
  identityPoolId: IDENTITY_POOL_ID,
  identityRoleArn: IDENTITY_ROLE_ARN
});

const userModel = new UserModel(URL_USERS_API);

export default function register({ username, password, fullname, genre, birthdate }) {
  console.info('Getting user identity');
  return provider.getUserIdentity()
    .then(identityId => {
      let user = {
        username,
        fullname,
        genre,
        birthdate: new Date(birthdate).toISOString(),
        password: getEncryptedPassword(password),
        identity_id: identityId,
        user_status: 'idle',
        email_status: 'subscribed',

        // profile data
        space_used: 0,
        account_type: ACCOUNT_TYPE_BASIC,
        notifications_enabled: true
      };

      console.info('Creating a new user with params: ', JSON.stringify(user, null, 2));
      return userModel.create(user);
    })
    .catch(err => {
      console.error('An error occurred registering username ' + username + '. ' + err);
      throw err;
    });
}
