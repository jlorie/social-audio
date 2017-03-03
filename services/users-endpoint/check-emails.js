import _ from 'lodash';
import UserModel from '../commons/resources/user-model';
import { USER_STATUS } from '../commons/constants';

const userModel = new UserModel(process.env.USERS_URI);

export function checkEmails(emails) {
  let unique = _.uniq(emails);
  return userModel.batchGet(unique)
    .then(users => users.filter(user => user.user_status !== USER_STATUS.PENDING))
    .then(users => users.map(user => ({
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      photo_url: user.photo_url
    })));
}
