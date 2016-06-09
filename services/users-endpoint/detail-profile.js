import UserModel from '../commons/resources/user-model';
import GeneralConfig from '../commons/resources/general-config';

const URI_USERS = process.env.URI_USERS;

const config = new GeneralConfig();
const userModel = new UserModel(URI_USERS);

export function detailProfile(id) {
  console.info('Resolving details for user ' + id);

  return userModel.getById(id)
    .then(user => {
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
              notifications_enabled: user.notifications_enabled || true
            }
          };

          return output;
        });
    });
}
