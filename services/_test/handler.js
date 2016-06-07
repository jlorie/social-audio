import NotificationModel from '../commons/resources/notification-model';

const notificationModel = new NotificationModel('dev-notifications');
export default (event, context) => {
  return notificationModel.getPendingNotifications('d9d77ea5-4d11-4610-a359-14dfd5e4b7f7')
    .then(notifications => {
      console.log(`${notifications.length} pending notifications`);
      return 'End!';
    });
};
