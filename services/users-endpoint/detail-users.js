import UserModel from '../commons/resources/user-model';
import { ERR_SECURITY } from '../commons/constants';

const userModel = new UserModel(process.env.USERS_URI);

export function detailUser(id) {
  console.info('Resolving details for user ' + id);
  return userModel.getById(id)
    .then(user => {
      if (!user) {
        throw new Error(ERR_SECURITY.INVALID_USER);
      }

      let output = {
        id: user.id,
        email: user.username,
        fullname: user.fullname,
        genre: user.genre,
        photo_url: user.photo_url
      };

      return output;
    });
}

export function detailMultipleUsers(ids) {
  console.info(`Resolving details for ${ids.length} users`);
  return Promise.all(ids.map(detailUser));
}
