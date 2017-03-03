import _ from 'lodash';
import UserModel from '../commons/resources/user-model';
import GeneralConfig from '../commons/resources/general-config';
import { ERR_AWS } from '../commons/constants'

const config = new GeneralConfig();
const userModel = new UserModel(process.env.USERS_URI);

export function detailProfile(id) {
  console.info('Resolving details for user ' + id);

  return userModel.getById(id)
    .then(formatProfileOutput);
}

export function updateProfile(userId, data) {
  data.profile = data.profile || {};
  data.preferences = data.preferences || {};

  let updateData = {
    fullname: data.profile.fullname,
    birthdate: data.profile.birthdate,
    genre: data.profile.genre,
    notifications_enabled: data.preferences.notifications_enabled
  };

  return userModel.getById(userId)
    .then(user => {
      let cleanData = _.omitBy(updateData, _.isNil);
      return userModel.update(user.username, cleanData);
    })
    .then(formatProfileOutput)
    .catch(err => {
      return {
        status: 'ERROR',
        message: ERR_AWS.INVALID_PARAMS
      };
    });
}

function formatProfileOutput(user) {
  // Checking notifications configuration
  let notificationsConfig = true;
  if ('notifications_enabled' in user) {
    notificationsConfig = user.notifications_enabled;
  }

  return config.get('account_space')
    .then(spaces => {
      let output = {
        profile: {
          id: user.id,
          email: user.username,
          fullname: user.fullname,
          genre: user.genre,
          birthdate: user.birthdate,
          photo_url: user.photo_url
        },
        account: {
          type: user.account_type || 'basic',
          user_space: {
            used: user.space_used,
            total: spaces[user.account_type]
          }
        },
        preferences: {
          notifications_enabled: notificationsConfig
        }
      };

      return output;
    });
}
