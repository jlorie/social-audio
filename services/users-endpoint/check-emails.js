import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export function checkEmails(emails) {
  return userModel.getByUsernames(emails)
    .then(users => users.map(user => ({
      id: user.id,
      username: user.username,
      fullname: user.fullname
    })));
}
