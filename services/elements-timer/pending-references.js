import ElementUserModel from '../commons/resources/element-user-model';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUsers = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function nextInactiveElementFor(userId) {
  console.info('Getting oldest inactive element for user ' + userId);
  return elementsByUsers.getOldestPendingElements(userId, true)
    .then(references => references[0]);
}

export function nextPendingElementFor(userId) {
  console.info('Getting oldest pending element for user ' + userId);
  return elementsByUsers.getOldestPendingElements(userId, false)
    .then(elements => elements[0]);
}
