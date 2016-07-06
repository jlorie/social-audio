import NotificationModel from '../commons/resources/notification-model';

const URI_NOTIFICATIONS = 'dev-notifications';
const notificationModel = new NotificationModel(URI_NOTIFICATIONS);

export default () => {
  const userId = '07484310-0a1a-48e0-b9c7-28257150f04a';
  const elementId = '2a70b7f684b7fb9f5345071f52281bf6';

  return notificationModel.getPendingRequest({ userId, elementId });
};
