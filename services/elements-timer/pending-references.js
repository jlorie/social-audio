import _ from 'lodash';

import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUsers = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function nextInactiveElementFor(userId, withExpireTime = false) {
  console.info('Getting oldest inactive element for user ' + userId);
  return elementsByUsers.getOldestElements(userId, REF_STATUS.IDLE)
    .then(references => references.find(r => _.has(r, 'expire_at') === withExpireTime));
}

export function nextPendingElementFor(userId, withExpireTime = false) {
  console.info('Getting oldest pending element for user ' + userId);
  return elementsByUsers.getOldestElements(userId, REF_STATUS.PENDING)
    .then(references => references.find(r => _.has(r, 'expire_at') === withExpireTime));
}
