import moment from 'moment';
import selectUsers from './select-users';
import { nextPendingElementFor, nextInactiveElementFor } from './pending-references';
import notifyUser from './notify';
import markRefAsExpired from './mark-references';

import { NOTIFICATION_TYPE, ERR_NOTIFICATIONS, SUCCESS } from '../commons/constants';

export default (hour, notificationType) => {
  // calculate timezone offset for user
  let offset = calculateOffset(hour);
  console.info(`Processing reminder config ${notificationType} with offset ${offset}`);

  return selectUsers(offset).then(users => {
    // getting pending reference and notifying correspondant user
    let taskMap = users.map(user => {
      return resolvePendingRef(user.id, notificationType)
        .then(ref => notifyUser(user, ref, notificationType).then(() => ref))
        .then(ref => {
          // trying to mark reference as expired
          if (notificationType === NOTIFICATION_TYPE.PENDING_ELEMENT_EXPIRED ||
            notificationType === NOTIFICATION_TYPE.INACTIVE_ELEMENT_EXPIRED) {
            return markRefAsExpired(ref).then(SUCCESS);
          }

          return SUCCESS;
        });
    });

    return Promise.all(taskMap).then(() => SUCCESS);
  });
};

function resolvePendingRef(userId, notificationType) {
  let func;
  switch (notificationType) {
    case NOTIFICATION_TYPE.PENDING_AUDIO:
    case NOTIFICATION_TYPE.PENDING_ELEMENT_EXPIRED:
      {
        func = nextPendingElementFor;
        break;
      }

    case NOTIFICATION_TYPE.INACTIVE_ELEMENT:
    case NOTIFICATION_TYPE.INACTIVE_ELEMENT_EXPIRED:
      {
        func = nextInactiveElementFor;
        break;
      }
    default:
      throw new Error(ERR_NOTIFICATIONS.INVALID_TYPE);
  }

  return func(userId);
}

function calculateOffset(desiredHour) {
  const currentHour = moment.utc().hour();

  let result;
  for (let offset = -11; offset <= 12; offset++) {
    if (desiredHour === (currentHour + offset) % 24) {
      result = offset;
      break;
    }
  }

  return result;
}
