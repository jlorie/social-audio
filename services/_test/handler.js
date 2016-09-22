import NotificationModel from '../commons/resources/notification-model';

const notificationModel = new NotificationModel('dev-notifications');
export default () => {
  let types = ['pending_audio', 'audio_request'];
  let userId = '07484310-0a1a-48e0-b9c7-28257150f04a';
  return notificationModel.getByUserId({ userId, types, limit: 1200 });
};
