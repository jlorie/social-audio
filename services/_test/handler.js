import ElementUserModel from '../commons/resources/element-user-model';

const elementsByUserModel = new ElementUserModel('dev-elements-by-users');
export default (event, context) => {
  let userId = 'd9d77ea5-4d11-4610-a359-14dfd5e4b7f7';
  return getElements(userId)
    .then(updateReferences);
};

function getElements(userId) {
  console.log('Getting references');
  return elementsByUserModel.get({ userId })
    .then(elements => elements.items.filter(e => e.created_at.indexOf('owner') !== -1));
}

function updateReferences(references) {
  let refStatus = {
    ref_status: 'resolved'
  };

  return Promise.all(references.map(reference => {
    console.log('Updating reference ' + reference.id);
    return elementsByUserModel.update(reference.id, refStatus);
  }));
}
