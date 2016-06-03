import _ from 'lodash';

import { listElements } from './list-elements';
import { detailElement } from './detail-element';
import { shareElement, shareMultipleElements } from './share-elements';
import { deleteElement, deleteMultipleElements } from './delete-elements';
import { detachAudio } from './detach-audio';

export default (event, context) => {
  console.info('=> Input: ', JSON.stringify(event, null, 2));

  try {
    return handleRequest(event)
      .then(result => {
        console.info('==> Success: ', JSON.stringify(result, null, 2));
        context.succeed(result);
      })
      .catch(err => {
        console.info('==> An error occurred. ', err.stack);
        throw err;
      });
  } catch (err) {
    let error = {
      status: 'ERROR',
      message: err.message
    };
    context.fail(JSON.stringify(error));
  }
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
        if (!_.isArray(input.element_ids) || input.element_ids.length === 0) {
          throw new Error('InvalidParameters');
        }

        result = deleteMultipleElements(input.element_ids, userId);
        break;
      }
    case 'share':
      {
        result = shareElement(input.element_id, input.usernames, userId);
        break;
      }
    case 'batch_share':
      {
        result = shareMultipleElements(input.element_ids, input.usernames, userId);
        break;
      }
    case 'detach_audio':
      {
        result = detachAudio(input.element_id, input.attachment_id, userId);
        break;
      }
    default:
      {
        throw new Error('ActionNotSupported');
      }
  }

  return result;
}
