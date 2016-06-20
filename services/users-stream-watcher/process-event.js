import { deleteElementsFor } from './elements-delete';
import { SUCCESS, ERR_ACTION } from '../commons/constants';

const INSERT = 'INSERT';
const MODIFY = 'MODIFY';
const REMOVE = 'REMOVE';

export function processEvent(record) {
  let result;
  switch (record.eventName) {
    case INSERT:
      {
        result = Promise.resolve(SUCCESS);
        break;
      }
    case MODIFY:
      {
        result = Promise.resolve(SUCCESS);
        break;
      }
    case REMOVE:
      {
        // get user id
        let oldImage = record.dynamodb.OldImage;
        let userId = oldImage.id.S;

        // delete elements owned by the user
        result = deleteElementsFor(userId);
        break;
      }
    default:
      {
        console.info('Unfined Action');
        return Promise.resolve(ERR_ACTION.UNDEFINED);
      }
  }

  return result;
}
