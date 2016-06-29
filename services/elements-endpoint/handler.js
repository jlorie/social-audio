import _ from 'lodash';

import { listElements } from './list-elements';
import { detailElement } from './detail-element';
import { deleteElement, deleteMultipleElements } from './delete-elements';
import { detachAudio } from './detach-audio';
import { markElementAsViewed } from './mark-notification';
import { resolveSharedWith } from './shared_with';
import { updateFavoriteStatus } from './mark-favorite';

const YES = 'yes';

export default (event, context) => {
  console.info('=> Input: ', JSON.stringify(event, null, 2));

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

function handleRequest(input) {
  let result;
  let userId = input.identity_id.split(':').pop();

  try {
    switch (input.action) {
      case 'list':
        {
          result = listElements(userId);
          break;
        }
      case 'detail':
        {
          let tasks = [
            detailElement(input.element_id, userId),
            markElementAsViewed(input.element_id, userId)
          ];

          result = Promise.all(tasks).then(results => results[0]);
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
      case 'detach_audio':
        {
          result = detachAudio(input.element_id, input.attachment_id, userId);
          break;
        }
      case 'shared_with':
        {
          result = resolveSharedWith(input.element_id, userId);
          break;
        }
      case 'favorite':
        {
          result = updateFavoriteStatus(input.element_id, userId, input.favorite === YES);
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
