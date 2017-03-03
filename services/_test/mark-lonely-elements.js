import ResourceModel from '../commons/resources/resource-model';

const IDLE_STATUS = 'idle';
const STAGE = process.env.SERVERLESS_STAGE;
const TABLENAME = `${STAGE}-elements-by-users`;
const resourceModel = new ResourceModel(TABLENAME);

export default () => {
  return resourceModel.get({ limit: Number.MAX_VALUE })
    .then(mapElements)
    .then(filterElements)
    .then(results => {
      console.info(`Marking ${results.length} references as idle`);
      return Promise.all(results.map(ref => markRefAsPending(ref.user_id, ref.created_at)));
    });
};

function mapElements(elements) {
  console.info(`Mapping ${elements.length} elements`);
  let elementsMap = new Map();

  for (let element of elements) {
    let value = elementsMap.get(element.id);
    if (!value) {
      value = {
        count: 1,
        hasOwner: element.created_at.endsWith('owner'),
        created_at: element.created_at,
        user_id: element.user_id,
        ref_status: element.ref_status
      };
    } else {
      value = {
        count: value.count + 1,
        hasOwner: element.created_at.endsWith('owner') || value.hasOwner
      };
    }

    elementsMap.set(element.id, value);
  }

  return elementsMap;
}

function filterElements(map) {
  let results = [];
  for (let [elementId, data] of map) {
    if (data.count === 1 && data.hasOwner && data.ref_status !== IDLE_STATUS) {
      data.id = elementId;
      results.push(data);
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
  return resourceModel.update(key, { ref_status: IDLE_STATUS });
}
