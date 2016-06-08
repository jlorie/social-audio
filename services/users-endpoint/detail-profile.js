import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export function detailProfile(id) {
  console.info('Resolving details for user ' + id);

  return userModel.getById(id)
    .then(user => {
      let output = {
        profile: {
          id: user.id,
          email: user.username,
          fullname: user.fullname,
          genre: user.genre,
          birthdate: user.birthdate,
          photo_url: user.photo_url
        }
      };

      return output;
    });
}
