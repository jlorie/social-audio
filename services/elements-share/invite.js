import FunctionInvoker from '../commons/remote/function-invoker';
import { INVOKE_TYPE } from '../commons/remote/function-invoker';

const URI_USERS_INVITE = process.env.URI_USERS_INVITE;
const invoker = new FunctionInvoker(URI_USERS_INVITE);

export function inviteUsers(hostId, emails) {
  let noEmails = emails.length === 0;
  if (noEmails) {
    Promise.resolve('OK');
  }

  console.info('Inviting new ' + emails.length + ' users');

  let body = JSON.stringify({ identity_id: hostId, emails });
  return invoker.invoke({ body, type: INVOKE_TYPE.Event });
}
