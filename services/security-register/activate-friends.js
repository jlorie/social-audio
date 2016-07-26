import FunctionInvoker, { INVOKE_TYPE } from '../commons/remote/function-invoker';

const URI_FRIENDS_ENDPOINT = process.env.URI_FRIENDS_ENDPOINT;
const friendsEndpoint = new FunctionInvoker(URI_FRIENDS_ENDPOINT);

export function activateAsFriend(friendId) {
  console.info(`Activating friend ${friendId}`);

  let body = JSON.stringify({
    action: 'activate',
    friend_id: friendId
  });

  return friendsEndpoint.invoke({ body, type: INVOKE_TYPE.Event });
}
