import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export function resolveUserId(username) {
  console.info('Resolving user id for ' + username);

  return userModel.getByUsernames([username])
    .then(results => {
      let user = results[0];
      if (!user) {
        throw new Error('InvalidUsername');
      }

      return user.id;
    });
}

export function updateProfilePicture(username, sourceUrl) {
  console.info('Updating profile picture url');
  return userModel.update(username, { photo_url: sourceUrl });
}
