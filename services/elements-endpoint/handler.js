import _ from 'lodash';

import { listElements } from './list-elements';
import { detailElement } from './detail-element';
import { deleteElement, deleteMultipleElements } from './delete-elements';
import { detachAudio } from './detach-audio';
import { markElementAsViewed } from './mark-notification';
import { resolveSharedWith } from './shared_with';
import { updateFavoriteStatus } from './mark-favorite';
import { updateAudioPrivacies } from './update-privacy';
import { filterByFriend } from './filter-by-friend';

const YES = 'yes';
const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  event.stage = STAGE;
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

function handleRequest(req) {
  let result;
  let userId = req.identity_id.split(':').pop();

  try {
    switch (req.action) {
      case 'list':
        {
          result = listElements(userId);
          break;
        }
      case 'detail':
        {
          let tasks = [
            detailElement(req.element_id, userId),
            markElementAsViewed(req.element_id, userId)
          ];

          result = Promise.all(tasks).then(results => results[0]);
          break;
        }
      case 'delete':
        {
          result = deleteElement(req.element_id, userId);
          break;
        }
      case 'batch_delete':
        {
          if (!_.isArray(req.element_ids) || req.element_ids.length === 0) {
            throw new Error('InvalidParameters');
          }

          result = deleteMultipleElements(req.element_ids, userId);
          break;
        }
      case 'detach_audio':
        {
          result = detachAudio(req.element_id, req.attachment_id, userId);
          break;
        }
      case 'shared_with':
        {
          result = resolveSharedWith(req.element_id, userId);
          break;
        }
      case 'favorite':
        {
          result = updateFavoriteStatus(req.element_id, userId, req.favorite === YES);
          break;
        }
      case 'filter_friend':
        {
          result = filterByFriend(userId, req.friend_id);
          break;
        }

      case 'privacy':
        {
          let params = {
            audioId: req.audio_id,
            elementId: req.element_id,
            isPublic: req.public === YES,
            userId
          };

          result = updateAudioPrivacies(params);
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
