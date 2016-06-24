import { getElementUrl } from './elements';

export default (event, context) => {
  console.info('==> Input: ', JSON.stringify(event, null, 2));

  return handleRequest(event)
    .then(result => {
      if (event.action === 'list') {
        console.info('==> Success: ' + result.items.length + ' items listed');
      } else {
        console.info('==> Success: ', JSON.stringify(result, null, 2));
      }

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
  let userId = request.identity_id.split(':').pop();

  try {
    switch (request.resource) {
      case 'element':
        {
          result = getElementUrl(userId, request.element_id, request.option);
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
