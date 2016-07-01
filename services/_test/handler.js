import Notification from '../commons/remote/notification';

const endpoint = 'arn:aws:sns:us-east-1:141310850160:endpoint/APNS/prod-bbluue-ios/fed0eb23-a45e-3b46-8479-193b7da6a9a4';
export default (event, context) => {
  return Notification.enableDeviceEndpoint(endpoint);
};
