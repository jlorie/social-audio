import ElementUserModel from '../commons/resources/element-user-model';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUsers = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export default (userId) => {
  console.info('Getting oldest pending element for user ' + userId);
  return elementsByUsers.getOldestPendingElements(userId)
    .then(elements => elements[0])
    .catch(err => {
      console.info('An error ocurred: ', err);
      throw err;
    });
};
