import ElementUserModel from '../commons/resources/element-user-model';
import { ERR_SECURITY } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function resolveSharedWith(elementId, userId) {
  console.info('Resolving users related with element ' + elementId);

  return elementsByUserModel.getById(elementId)
    .then(results => results.map(ref => ref.user_id))
    .then(userIds => {
      // check permissions
      let hasPermissions = userIds.indexOf(userId) !== -1;
      if (!hasPermissions) {
        throw new Error(ERR_SECURITY.ACCESS_DENIED);
      }

      return {
        user_ids: userIds
      };
    });
}
