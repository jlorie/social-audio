import _ from 'lodash';
import moment from 'moment';

import ElementUserModel from '../commons/resources/element-user-model';
import config from './config';
import { REF_STATUS } from '../commons/constants';

// TODO grab values from config
const daysToBecomeElegible = 5;

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUsers = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function nextInactiveElementFor(userId, withExpireTime = false) {
  console.info('Getting oldest inactive element for user ' + userId);
  return elementsByUsers.getOldestElements(userId, REF_STATUS.IDLE)
    .then(references => {
      // filter references with audios only
      let filtered = references.filter(ref => {
        const dates = ref.created_at.split('|');
        const uploadedDate = new Date(dates.length > 2 ? dates[1] : dates[0]);

        // an element become elegible for expiration when is 5 days old
        let diff = moment.duration(moment().utc().diff(moment(uploadedDate))).days();
        let elegible = diff >= daysToBecomeElegible;

        return elegible && !hasAudios(ref);
      });

      // TODO sort by uploaded time
      return config('inactive_max_expire')
        .then(maxReferences => {
          let results = [];

          // getting oldest references with expire_at field
          for (let ref of filtered) {
            if (_.has(ref, 'expire_at') === withExpireTime) {
              results.push(ref);
            }

            // when max is reached then stop cycle
            if (results.length >= maxReferences) {
              break;
            }
          }
          return results;
        });
    });
}

export function nextPendingElementFor(userId, withExpireTime = false) {
  console.info('Getting oldest pending element for user ' + userId);
  return elementsByUsers.getOldestElements(userId, REF_STATUS.PENDING)
    .then(references => {
      // TODO sort by uploaded time
      return config('pending_audio_max_expire')
        .then(maxReferences => {
          let results = [];

          // getting oldest references with expire_at field
          for (let ref of references) {
            if (_.has(ref, 'expire_at') === withExpireTime) {
              results.push(ref);
            }

            // when max is reached then stop cycle
            if (results.length >= maxReferences) {
              break;
            }
          }
          return results;
        });
    });
}

function hasAudios(ref) {
  let audios = ref.audios;
  if (!audios || audios === 0 || (_.isObject(audios) && _.isEmpty(audios))) {
    return false;
  }

  return true;
}
