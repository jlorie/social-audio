import ElementModel from '../commons/resources/element-model';
import UserModel from '../commons/resources/user-model';

import { ERR_ELEMENTS, ERR_USERS, NOTIFICATION_TYPE } from '../commons/constants';

const URI_USERS = process.env.URI_USERS;
const URI_ELEMENTS = process.env.URI_ELEMENTS;

const userModel = new UserModel(URI_USERS);
const elementModel = new ElementModel(URI_ELEMENTS);

// resolveNotificationDetails
export default (notificationType, ref) => {
  console.info(`Resolving notification details for reference ${ref.id}`);

  // getting owner data
  return elementModel.getById(ref.id)
    .then(element => {
      if (!element) {
        throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
      }

      return userModel.getById(element.owner_id);
    })
    .then(user => {
      if (!user) {
        throw new Error(ERR_USERS.INVALID_USER);
      }

      let details = {
        thumbnail_url: ref.thumbnail_url,
        element_owner_id: user.id,
        element_owner_name: user.fullname,
        expire_at: ref.expire_at,
      };

      if (notificationType === NOTIFICATION_TYPE.PENDING_AUDIO ||
        notificationType === NOTIFICATION_TYPE.PENDING_ELEMENT_EXPIRED) {
        details.shared_at = ref.created_at.split('|')[0];
      }

      return details;
    });
};
