import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export default (element) => {
  let createdAtData = [element.created_at, element.uploaded_at, 'owner'];
  let key = {
    user_id: element.owner_id,
    created_at: createdAtData.filter(i => i).join('|')
  };

  return elementsByUserModel.rawUpdate(key, { ref_status: REF_STATUS.RESOLVED });
};
