import { listElements } from './list-elements';
import { detailElement } from './detail-element';
import { shareElement } from './share-element';
import { deleteElement, deleteMultipleElements } from './delete-elements';

export default (event, context) => {
  console.info('=> Input: ', JSON.stringify(event, null, 2));

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
    case 'delete':
      {
        result = deleteElement(input.element_id, userId);
        break;
      }
    case 'batch_delete':
      {
        result = deleteMultipleElements(input.element_ids, userId);
        break;
      }
    case 'share':
      {
        result = shareElement(input.element_id, userId, input.usernames);
        break;
      }
    default:
      {
        throw new Error('action not supported');
      }
  }

  return result;
}
