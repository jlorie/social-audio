import register from './register';
import { notify, sendWellcomeMail } from './notify-registered-user';

export default (event, context) => {
  let input = {
    username: event.username,
    fullname: event.fullname,
    genre: event.genre,
    birthdate: event.birthdate,
    password: event.password,
  };

  console.info('Input: ' + JSON.stringify(input, null, 2));

  return register(input)
    .then(user => {
      let tasks = [
        notify(user),
        sendWellcomeMail(user.username)
      ];

      return Promise.all(tasks)
        .then(() => {
          let result = {
            user_id: user._id
          };

          return result;
        });
    })
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      console.error('==> An error occurred. ', err.stack);

      let error = {
        status: 'ERROR',
        message: err.message
      };
      context.fail(JSON.stringify(error));
    });
};
