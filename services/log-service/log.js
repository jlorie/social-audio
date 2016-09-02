import UserLogModel from '../commons/resources/user-log-model';

const DELETED_USER_TOPIC = process.env.DELETED_USER_TOPIC;
const REGISTERED_USER_TOPIC = process.env.REGISTERED_USER_TOPIC;
const REGISTERED_ELEMENT_TOPIC = process.env.REGISTERED_ELEMENT_TOPIC;
const DELETED_ELEMENT_TOPIC = process.env.DELETED_ELEMENT_TOPIC;
const URL_USERS_LOG_API = process.env.URL_USERS_LOG_API;
const userLogModel = new UserLogModel(URL_USERS_LOG_API);

export function createLog(dataLog) {
  console.info('Entra en el createLog' + JSON.stringify(dataLog, null, 2));
  let logData = {
    userId: dataLog.userId
  };
  switch (dataLog.topicArn) {
    case REGISTERED_USER_TOPIC:
      {
        logData.userAction = 'registered_user';
        break;
      }
    case DELETED_USER_TOPIC:
      {
        logData.userAction = 'deleted_user';
        break;
      }
    case REGISTERED_ELEMENT_TOPIC:
      {
        logData.userAction = 'registered_element';
        break;
      }
    case DELETED_ELEMENT_TOPIC:
      {
        logData.userAction = 'deleted_element';
        break;
      }
    default:
      {
        break;
      }
  }
  return userLogModel.log({ userId: logData.userId, userAction: logData.userAction });
};
