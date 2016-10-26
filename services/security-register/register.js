import _ from 'lodash';
import CredentialProvider from '../commons/remote/credentials-provider';
import UserModel from '../commons/resources/user-model';

import { getEncryptedPassword } from '../commons/helpers/password-helper';
import { USER_STATUS, ACCOUNT_TYPE, EMAIL_STATUS } from '../commons/constants';
import { activateAsFriend } from './activate-friends';

const URL_USERS_API = process.env.URL_USERS_API;
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
const IDENTITY_ROLE_ARN = process.env.IDENTITY_ROLE_ARN;

const provider = new CredentialProvider({
  identityPoolId: IDENTITY_POOL_ID,
  identityRoleArn: IDENTITY_ROLE_ARN
});

const userModel = new UserModel(URL_USERS_API);

export function register({ username, password, fullname, genre, birthdate, country }) {
  console.info('Getting user identity');
  let userData = {
    fullname,
    genre,
    country,
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
        // activate the pending user
        result = activatePendingUser(username, userData, user.id);
      } else {
        throw new Error('UserAlreadyExists');
      }

      return result;
    })
    .catch(err => {
      console.info('An error occurred registering username ' + username + '. ' + err);
      throw err;
    });
}

export function registerPending(usernames) {
  console.info('Registering pending users: ' + usernames);
  let existingUsers = [];

  // deleting duplicates
  return userModel.batchGet(usernames)
    .then(users => {
      // filtering users not registered yet
      let newUsernames = usernames.filter(username => {
        let userData = users.find(user => user.username === username);
        if (!userData) {
          return true;
        }

        existingUsers.push(userData);
        return false;
      });

      // resolve user data
      return Promise.all(newUsernames.map(u => formatUserData(u)));
    })
    .then(newUsersData => userModel.batchCreate(newUsersData)) // creating new users
    .then(users => _.concat(users, existingUsers)); // adding existing users to results
}


function formatUserData(username) {
  return provider.getUserIdentity().then(identityId => {
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

function createNewUser(userData) {
  console.info('Creating a new user: ', userData.username);

  return provider.getUserIdentity()
    .then(identityId => {
      return isIdentityRegistered(identityId)
        .then(identityExists => {
          if (identityExists) {
            console.info('Identity id already exist retrying ...');
            return createNewUser(userData);
          }

          // configuring identity
          userData.created_at = new Date().toISOString();
          userData.id = identityId.split(':').pop();
          userData.identity_id = identityId;

          return userModel.create(userData);
        });
    });
}

function activatePendingUser(username, userData, userId) {
  console.info('Activating pending user : ' + username);
  let tasks = [
    userModel.update(username, userData),
    activateAsFriend(userId)
  ];

  return Promise.all(tasks).then(results => results[0]);
}

function isIdentityRegistered(identityId) {
  let id = identityId.split(':').pop();
  return userModel.getById(id)
    .then(user => {
      if (user) {
        return true;
      }

      return false;
    });
}
