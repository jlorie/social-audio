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
    .then(results => {
      // filter references with audios only
      let references = results.filter(ref => {
          const dates = ref.created_at.split('|');
          const uploadedDate = new Date(dates.length > 2 ? dates[1] : dates[0]);

          // an element become elegible for expiration when is 5 days old
          let diff = moment.duration(moment().utc().diff(moment(uploadedDate))).days();
          let elegible = diff >= daysToBecomeElegible;
          let matchExpireParam = _.has(ref, 'expire_at') === withExpireTime;

          return elegible && !hasAudios(ref) && matchExpireParam;
        })
        // sorting by uploaded_at field
        .sort((a, b) => a.uploaded_at > b.uploaded_at);

      return config('inactive_max_expire')
        .then(maxReferences => references.slice(0, maxReferences));
    });
}

export function nextPendingElementFor(userId, withExpireTime = false) {
  console.info('Getting oldest pending element for user ' + userId);

  return elementsByUsers.getOldestElements(userId, REF_STATUS.PENDING)
    .then(results => {
      // discard non-elegible references
      let references = results.filter(ref => {
        const sharedDate = ref.created_at.split('|')[0];

        // an element become elegible for expiration when is 5 days old
        let diff = moment.duration(moment().utc().diff(moment(sharedDate))).days();
        let elegible = diff >= daysToBecomeElegible;
        let matchExpireParam = _.has(ref, 'expire_at') === withExpireTime;

        return elegible && matchExpireParam;
      });

      return config('pending_audio_max_expire')
        .then(maxReferences => references.slice(0, maxReferences));
    });
}

function hasAudios(ref) {
  let audios = ref.audios;
  if (!audios || audios === 0 || (_.isObject(audios) && _.isEmpty(audios))) {
    return false;
  }

  return true;
}
