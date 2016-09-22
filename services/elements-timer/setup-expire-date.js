import moment from 'moment';
import config from './config';
import ElementUserModel from '../commons/resources/element-user-model';
import { CONFIG } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementsByUsers = new ElementUserModel(URI_ELEMENTS_BY_USERS);
// setupExpireDate
export default (ref) => {
  console.info(`Setting expire date to references with user ${ref.user_id} and element ${ref.id}`);

  return config(CONFIG.EXPIRE_TIME)
    .then(expireTime => {
      if (!expireTime) {
        throw new Error('InvalidExpireTimeConfig');
      }

      let expireDate = moment().utc().add(expireTime, 'hour').toISOString();
      return elementsByUsers.update(ref.id, ref.user_id, { expire_at: expireDate });
    });
};
