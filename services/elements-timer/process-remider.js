import notify from './notify';
import selectUsers from './select-users';
import markRefAsExpired from './mark-references';
import resolveNotificationDetails from './notification-details';
import setupExpireDate from './setup-expire-date';

import { nextPendingElementFor, nextInactiveElementFor } from './pending-references';
import { NOTIFICATION_TYPE, ERR_NOTIFICATIONS, SUCCESS, EMPTY } from '../commons/constants';

export default (config, currentHour) => {
  let desiredHour = config.hour;
  let notificationType = config.notification_type;
  let action = config.action;

  // calculate timezone offset for user
  let offset = calculateOffset(currentHour, desiredHour);
  if (!offset) {
    return Promise.resolve(EMPTY);
  }

  return selectUsers(offset).then(users => {
    // When action is 'start' then the system fix a expire date
    let isStartAction = action === 'start';

    // getting pending reference and notifying correspondant user
    let taskMap = users.map(user => {
      return resolvePendingRef(user.id, notificationType, !isStartAction)
        .then(references => {
          if (!references.length) {
            return Promise.resolve(EMPTY);
          }

          let updateRef = (ref) => {
            console.info(`Processing reminder ${notificationType} with element \
${ref.id} for user ${user.id}`);

            return updateReference(ref, notificationType, isStartAction)
              .then(newRef => resolveNotificationDetails(notificationType, newRef))
              .then(details => notify(user.id, ref.id, details, notificationType));
          };

          return Promise.all(references.map(updateRef));
        });
    });

    return Promise.all(taskMap).then(() => SUCCESS);
  });
};

function updateReference(ref, notificationType, isStartAction) {
  if (notificationType === NOTIFICATION_TYPE.PENDING_ELEMENT_EXPIRED ||
    notificationType === NOTIFICATION_TYPE.INACTIVE_ELEMENT_EXPIRED) {
    // trying to mark reference as expired
    return markRefAsExpired(ref);
  } else if (isStartAction) {
    // setting up expire date
    return setupExpireDate(ref);
  }

  return Promise.resolve(ref);
}

function resolvePendingRef(userId, notificationType, withExpireTime) {
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

  return func(userId, withExpireTime);
}

function calculateOffset(currentHour, desiredHour) {
  let result;
  for (let offset = -11; offset <= 12; offset++) {
    let tmpHour = currentHour + offset;
    if (desiredHour === (tmpHour < 0 ? 24 + tmpHour : tmpHour % 24)) {
      result = offset;
      break;
    }
  }

  return result;
}
