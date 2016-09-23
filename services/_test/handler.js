import NotificationModel from '../commons/resources/notification-model';

const notificationModel = new NotificationModel('dev-notifications');

export default () => {
  let userId = '07484310-0a1a-48e0-b9c7-28257150f04a';
  let elementId = 'ea2e32a705b097e7935d6165b35eb908';
  return notificationModel.getPendingNotifications({ userId, elementId });
};
