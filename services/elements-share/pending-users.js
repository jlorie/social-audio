import uuid from 'node-uuid';
import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export function registerPendingUsers(usernames) {
  let isEmpty = usernames.length === 0;
  if (isEmpty) {
    return Promise.resolve([]);
  }

  console.info(`Registering ${usernames.length} pending users`);
  let newUsers = usernames.map(username => ({
    username,
    user_status: 'pending',
    created_at: new Date().toISOString(),
    id: uuid.v1()
  }));

  return userModel.batchCreate(newUsers)
    .then(() => newUsers.map(u => u.id));
}
