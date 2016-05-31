import { listElements } from './list-elements';
import { detailElement } from './detail-element';

export default (event, context) => {
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  return handleRequest(event)
    .then(result => {
      console.error('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      console.error('==> An error occurred. ', err.stack);

      let error = {
        status: 'ERROR',
        message: err.message
      };
      context.fail(JSON.stringify(error));
    });
};

function handleRequest(input) {
  let result;
  let userId = input.identity_id.split(':').pop();

  switch (input.action) {
    case 'list':
      {
        result = listElements(userId);
        break;
      }
    case 'detail':
      {
        result = detailElement(input.element_id, userId);
        break;
      }
    default:
      {
        throw new Error('action not supported');
      }
  }

  return result;
}
