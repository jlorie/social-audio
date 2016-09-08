import ElementUserModel from '../commons/resources/element-user-model';
import { ERR_SECURITY } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function resolveSharedWith(elementId, userId) {
  console.info('Resolving users related with element ' + elementId);

  return elementsByUserModel.getById(elementId)
    .then(results => {
      // check permissions
      let hasPermissions = results.find(ref => ref.user_id);
      if (!hasPermissions) {
        throw new Error(ERR_SECURITY.ACCESS_DENIED);
      }

      // discarding obvious users (owner and requester user)
      let filtered = results.filter(ref => {
        let isOwner = ref.created_at.split('|').pop() === 'owner';
        let isRequester = ref.user_id === userId;

        return !isOwner && !isRequester;
      });

      return { user_ids: filtered.map(ref => ref.id) };
    });
}
