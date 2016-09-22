import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export default (timezoneOffset) => {
  console.info('Getting users with timezone offset ' + timezoneOffset);
  return userModel.getByTimezoneOffset(timezoneOffset)
    // FIXME Solo para pruebas
    .then(users => users.filter(u => u.id === '07484310-0a1a-48e0-b9c7-28257150f04a'));
};
