import { updatePlaybaks } from './update-playbacks';

export default (event, context) => {
  console.info('==> Input: ', JSON.stringify(event, null, 2));

  return handleRequest(event)
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

function handleRequest(req) {
  let result;
  let userId = req.identity_id.split(':').pop();

  try {
    switch (req.action) {
      case 'count':
        {
          result = updatePlaybaks(userId, req.element_id, req.audios);
          break;
        }
      default:
        {
          throw new Error('ActionNotSupported');
        }
    }
  } catch (err) {
    return Promise.reject(err);
  }

  return result;
}
