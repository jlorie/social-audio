import moment from 'moment';
import NotificationModel from '../commons/resources/notification-model';

const notificationModel = new NotificationModel('dev-notifications');

export default () => {
  let userId = 'c6db8888-cfc5-4e4a-b130-80409469d21a';
  let notificationId = 'c538d2d0-4883-11e6-ab44-c95d86ebd39b';
  return notificationModel.getByUserId({ userId, id: notificationId });
};

function calculateOffset(hours) {
  let results = hours;
  const currentHour = moment.utc().hour();

  for (let offset = -11; offset <= 12; offset++) {
    let calculated = currentHour + offset;
    let index = hours.findIndex(h => h === calculated);
    if (index >= 0) {
      results[index] = offset;
    }
  }

  return results;
}
