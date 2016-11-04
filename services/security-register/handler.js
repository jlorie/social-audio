import { register, registerPending } from './register';
import { notify, sendWellcomeMail } from './notify-registered-user';
import { ERR_ACTION } from '../commons/constants';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  const input = event;
  input.stage = STAGE;
  console.info('Input: ' + JSON.stringify(input, null, 2));

  return handleRequest(input)
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);

      let error = {
        status: 'ERROR',
        message: err.message
      };
      context.fail(JSON.stringify(error));
    });
};

function handleRequest(request) {
  let result;
  switch (request.action) {
    case 'register':
      {
        let userData = {
          username: request.username,
          fullname: request.fullname,
          genre: request.genre,
          birthdate: request.birthdate,
          password: request.password,
          country: request.country,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString()
        };

        result = register(userData)
        .then(user => {
          let tasks = [
            notify(user),
            sendWellcomeMail(user.username)
          ];

          return Promise.all(tasks)
            .then(() => ({ user_id: user.id }));
        });
        break;
      }

    case 'register-pending':
      {
        result = registerPending(request.usernames);
        break;
      }

    default:
      {
        result = Promise.resolve(ERR_ACTION.UNDEFINED);
      }
  }

  return result;
}
