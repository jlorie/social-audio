import FunctionInvoker, { INVOKE_TYPE } from '../commons/remote/function-invoker';
import { SUCCESS, EMPTY } from '../commons/constants';

const PLAYBACKS_COUNTER = process.env.PLAYBACKS_COUNTER;
const SERVERLESS_STAGE = process.env.SERVERLESS_STAGE;

const invoker = new FunctionInvoker(PLAYBACKS_COUNTER, SERVERLESS_STAGE);

export function updatePlaybaks(userId, elementId, audioPlaybacks) {
  // TODO check user permissions
  console.info(`Updating playbacks for element ${elementId}`);

  let isEmpty = audioPlaybacks.length === 0;
  if (isEmpty) {
    console.info('Empty audio playbacks');
    return Promise.resolve(EMPTY);
  }

  let body = JSON.stringify({
    elementId,
    audioPlaybacks
  });

  return invoker.invoke({ body, type: INVOKE_TYPE.Event })
    .then(() => SUCCESS);
}
