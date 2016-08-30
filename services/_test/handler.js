import FunctionInvoker from '../commons/remote/function-invoker';

const functionName = 'bbluue-audios-test';
const stage = 'beta';

const invoker = new FunctionInvoker(functionName, stage);

export default () => {
  return invoker.invoke({})
    .then(response => {
      console.log('==> Success: ', JSON.stringify(response));
      return response;
    })
    .catch(err => {
      console.log('==> Error: ', JSON.stringify(err));
    });
};
