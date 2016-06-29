import CredentialProvider from '../commons/remote/credentials-provider';
import UserModel from '../commons/resources/user-model';

import { getEncryptedPassword } from '../commons/helpers/password-helper';
import { USER_STATUS, ACCOUNT_TYPE, EMAIL_STATUS } from '../commons/constants';

const URL_USERS_API = process.env.URL_USERS_API;
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
const IDENTITY_ROLE_ARN = process.env.IDENTITY_ROLE_ARN;

const provider = new CredentialProvider({
  identityPoolId: IDENTITY_POOL_ID,
  identityRoleArn: IDENTITY_ROLE_ARN
});

const userModel = new UserModel(URL_USERS_API);

export function register({ username, password, fullname, genre, birthdate }) {
  console.info('Getting user identity');
  let userData = {
    fullname,
    genre,
    birthdate: new Date(birthdate).toISOString(),
    password: getEncryptedPassword(password),
    email_status: EMAIL_STATUS.SUSCRIBED,
    user_status: USER_STATUS.DISABLED,

    // profile data
    space_used: 0,
    account_type: ACCOUNT_TYPE.BASIC,
    notifications_enabled: true
  };


  return userModel.getByUsername(username)
    .then(user => {
      let result;

      if (!user) {
        // create new uer
        userData.username = username;
        result = createNewUser(userData);
      } else if (user.user_status === USER_STATUS.PENDING) {
        // active the pending user
        result = activatePendingUser(username, userData);
      } else {
        throw new Error('UserAlreadyExists');
      }

      return result;
    })
    .catch(err => {
      console.error('An error occurred registering username ' + username + '. ' + err);
      throw err;
    });
}

export function registerPending(usernames) {
  console.info('Registering pending users: ' + usernames);

  // deleting duplicates
  return userModel.batchGet(usernames)
    .then(users => usernames.filter(u => !users.find(user => user.username === u)))
    .then(filteredUsernames => {
      // resolve user data
      let promises = filteredUsernames.map(username => formatUserData(username));

      return Promise.all(promises)
        .then(users => userModel.batchCreate(users));
    });


  function formatUserData(username) {
    return provider.getUserIdentity()
      .then(identityId => {
        let newUser = {
          id: identityId.split(':').pop(),
          username,
          user_status: USER_STATUS.PENDING,
          created_at: new Date().toISOString(),
          identity_id: identityId
        };

        return newUser;
      });
  }
}

function createNewUser(userData) {
  console.info('Creating a new user: ', userData.username);

  return provider.getUserIdentity()
    .then(identityId => {
      // configuring identity
      userData.created_at = new Date().toISOString();
      userData.id = identityId.split(':').pop();
      userData.identity_id = identityId;

      return userModel.create(userData);
    });
}

function activatePendingUser(username, userData) {
  console.info('Activating pending user : ' + username);
  return userModel.update(username, userData);
}
