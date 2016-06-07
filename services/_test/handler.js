import UserModel from '../commons/resources/user-model';

const userModel = new UserModel('dev-users');
export default (event, context) => {
  let emitterId = '0a73b017-e66c-4a41-bc58-ff4eb3e81db3';
  return userModel.getById(emitterId);
};
