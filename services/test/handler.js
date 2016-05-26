import UserModel from '../commons/resources/user-model';
const users = new UserModel('dev-users');

export default (event, context) => {
  let id = '480dad60-235f-11e6-ac06-ed503785c7b5';
  let username = 'calvarez@bbluue.com';

  return users.getByUsername(username)
    .then(result => {
      console.warn('==> Result: ', JSON.stringify(result, null, 2));
      return result;
    })
    .catch(err => {
      console.error('==> Error: ', err);
      throw err;
    });
};
