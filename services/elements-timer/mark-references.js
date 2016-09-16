import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUsers = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export default (ref) => {
  let key = {
    user_id: ref.user_id,
    created_at: ref.created_at
  };

  console.info(`Updating ref ${JSON.stringify(key, null, 2)} as expired`);
  return elementsByUsers.update(key, { ref_status: REF_STATUS.EXPIRED });
};
