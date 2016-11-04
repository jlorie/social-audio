import query from './query';

const ZeroDate = new Date('1970-01-01').toISOString();

export default (event, context) => {
  let input = event;
  input.stage = process.env.SERVERLESS_STAGE;
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  const Now = new Date().toISOString();
  let { from = ZeroDate, to = Now } = input;
  return query(from, to)
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
