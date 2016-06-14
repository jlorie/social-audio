import UserModel from '../commons/resources/user-model';
import Storage from '../commons/remote/storage';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export function updateProfilePicture(username, sourceUrl) {
  console.info('Updating profile picture url');

  return userModel.getByUsername(username)
    .then(user => {
      if (!user) {
        throw new Error('InvalidUsername');
      }

      let oldPicture = user.photo_url;
      return userModel.update(username, { photo_url: sourceUrl })
        .then(() => Storage.batchRemoveFiles([oldPicture])); // remove old picture
    });
}
