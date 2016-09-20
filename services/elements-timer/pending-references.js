import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUsers = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function nextInactiveElementFor(userId) {
  console.info('Getting oldest inactive element for user ' + userId);
  return elementsByUsers.getOldestElements(userId, REF_STATUS.IDLE)
    .then(references => references[0]);
}

export function nextPendingElementFor(userId) {
  console.info('Getting oldest pending element for user ' + userId);
  return elementsByUsers.getOldestElements(userId, REF_STATUS.PENDING)
    .then(elements => elements[0]);
}
