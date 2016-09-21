import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export default (timezoneOffset) => {
  console.info('Getting users with timezone offset ' + timezoneOffset);
  return userModel.getByTimezoneOffset(timezoneOffset);
};
