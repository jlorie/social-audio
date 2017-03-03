import _ from 'lodash';
import ResourceModel from '../../commons/resources/resource-model';

const RESOLVED_STATUS = 'resolved';
const IDLE_STATUS = 'idle';
const referenceModel = new ResourceModel(process.env.URI_REFERENCES);

export default () => {
  return referenceModel.get({ limit: Number.MAX_VALUE })
    .then(filterElements)
    .then(results => {
      console.info(`Marking ${results.length} references as idle`);
      // return 'OK';
      return Promise.all(results.map(ref => markRefAsPending(ref.user_id, ref.created_at)));
    });
};

function filterElements(references) {
  let results = [];
  for (let ref of references) {
    let isOwner = ref.created_at.indexOf('owner') >= 0;
    let hasNoAudio = ref.audios === undefined || ref.audios === 0 ||
      (_.isObject(ref.audios) && _.isEmpty(ref.audios));

    if (isOwner && ref.ref_status === RESOLVED_STATUS && hasNoAudio) {
      results.push(ref);
    }
  }

  return results;
}

function markRefAsPending(userId, createdAt) {
  let key = {
    user_id: userId,
    created_at: createdAt
  };

  console.info('==> Updating reference: ', JSON.stringify(key, null, 2));
  return referenceModel.update(key, { ref_status: IDLE_STATUS });
}
