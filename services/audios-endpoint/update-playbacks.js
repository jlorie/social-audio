import FunctionInvoker, { INVOKE_TYPE } from '../commons/remote/function-invoker';
import { SUCCESS } from '../commons/constants';

const PLAYBACKS_COUNTER = process.env.PLAYBACKS_COUNTER;
const invoker = new FunctionInvoker(PLAYBACKS_COUNTER);

export function updatePlaybaks(userId, elementId, audioPlaybacks) {
  // TODO check user permissions
  console.info(`Updating playbacks for element ${elementId}`);

  let body = JSON.stringify({
    elementId,
    audioPlaybacks
  });

  return invoker.invoke({ body, type: INVOKE_TYPE.Event })
    .then(() => SUCCESS);
}
