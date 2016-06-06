import FunctionInvoker from '../commons/remote/function-invoker';

const URI_SHARE_ENDPOINT = process.env.URI_SHARE_ENDPOINT;
const functionInvoker = new FunctionInvoker(URI_SHARE_ENDPOINT);

export function shareElement(userId, elementId, usernames) {
  console.info('Sharing element ' + elementId + ' with usernames ' + usernames);

  let body = JSON.stringify({
    action: 'share',
    element_id: elementId,
    identity_id: `us-east-1:${userId}`,
    usernames
  });

  return functionInvoker.invoke({ body, type: 'Event' });
}
