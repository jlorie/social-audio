import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUsers = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export default (ref) => {
  console.info(`Updating ref for element ${ref.id} and user ${ref.user_id} as expired`);
  return elementsByUsers.update(ref.id, ref.user_id, { ref_status: REF_STATUS.EXPIRED });
};
