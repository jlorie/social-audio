import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export function detailUser(id) {
  console.info('Resolving details for user ' + id);
  return userModel.getById(id)
    .then(user => {
      let output = {
        id: user.id,
        email: user.username,
        fullname: user.fullname,
        genre: user.genre
      };

      return output;
    });
}

export function detailMultipleUsers(ids) {
  console.info(`Resolving details for ${ids.length} users`);
  return Promise.all(ids.map(detailUser));
}
