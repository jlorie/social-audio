import UserModel from '../commons/resources/user-model';
import { extractObjectFromS3Message } from '../commons/helpers/utils';
import { register } from './register';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

export default (event, context) => {
  const { username, bucket, key } = extractObjectFromS3Message(event);
  console.info('==> Input: ', JSON.stringify(event, null, 2));

  return resolveUserId(username)
    .then(userId => {
      return register({ userId, bucket, key })
        .then((result) => {
          console.info('==> Success: ', result);
          return context.succeed(result);
        })
        .catch(err => {
          console.info('==> An error occurred. ', err.stack);
          return context.fail(err);
        });
    });
};

function resolveUserId(username) {
  console.info('Resolving user id for ' + username);

  return userModel.getByUsernames([username])
    .then(results => {
      let user = results[0];
      if (!user) {
        throw new Error('InvalidUsername');
      }

      return user.id;
    });
}
