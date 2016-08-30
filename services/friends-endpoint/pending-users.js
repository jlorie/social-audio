import FunctionInvoker from '../commons/remote/function-invoker';

const URI_REGISTER_ENDPOINT = process.env.URI_REGISTER_ENDPOINT;
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;

const registerPending = new FunctionInvoker(URI_REGISTER_ENDPOINT, SERVERLESS_STAGE);

export function registerPendingUsers(usernames) {
  let isEmpty = usernames.length === 0;
  if (isEmpty) {
    return Promise.resolve([]);
  }

  console.info(`Registering ${usernames.length} pending users`);
  let body = JSON.stringify({
    action: 'register-pending',
    usernames
  });

  return registerPending.invoke({ body })
    .then(result => {
      let users = JSON.parse(result.Payload);
      return users;
    });
}
