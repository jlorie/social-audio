import GeneralConfig from '../commons/resources/general-config';
import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);
const URI_GENERAL_CONFIG = process.env.URI_GENERAL_CONFIG;
const generalConfig = new GeneralConfig(URI_GENERAL_CONFIG);
const ACCOUNT_SPACE = 'account_space';
const accountTypes = generalConfig.getById(ACCOUNT_SPACE);

function checkUserSpace(userId) {
  // obtener usuario
  let user = userModel.getById(userId);
  // obtener el espacio maximo para el tipo de usuario accountTypes[user.account_type]
  let maxSpace = accountTypes[user.account_type];
  // comparar spaceUsed con espacio maximo
  if (maxSpace === user.space_used) {
    return true;
  }
}
