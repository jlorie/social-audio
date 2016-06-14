import UserModel from '../commons/resources/user-model';
import { push } from './push-notification';
import { email } from './email-notification';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export function notify({ emitterId, type, elementId, recipientIds }) {
  // get users data
  return userModel.batchGetByIds(recipientIds)
    .then(users => {
      let pendingUsers = [];
      let activeUsers = [];

      for (let user of users) {
        if (user.user_status === 'pending') {
          pendingUsers.push(user);
        } else {
          activeUsers.push(user);
        }
      }

      return userModel.getById(emitterId)
        .then(emitter => {
          let tasks = [
            push(activeUsers, type, elementId, emitter),
            email(pendingUsers, type, elementId, emitter)
          ];

          return Promise.all(tasks);
        });
    });
}
