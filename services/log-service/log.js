import { SUCCESS, ERR_ACTION } from '../commons/constants';

const INSERT = 'INSERT';
const MODIFY = 'MODIFY';
const REMOVE = 'REMOVE';

export function processEvent(record) {
  let result;
  switch (record.eventName) {
    case INSERT:
      {
        console.info('=== Action ===> INSERT ');
        result = Promise.resolve(SUCCESS);
        break;
      }
    case MODIFY:
      {
        console.info('=== Action ===> MODIFY');
        result = Promise.resolve(SUCCESS);
        break;
      }
    case REMOVE:
      {
        console.info('=== Action ===> REMOVE');
        result = Promise.resolve(SUCCESS);
        break;
      }
    default:
      {
        console.info('=== Unfined Action ===');
        return Promise.resolve(ERR_ACTION.UNDEFINED);
      }
  }

  return result;
}
