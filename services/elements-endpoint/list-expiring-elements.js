import ElementUserModel from '../commons/resources/element-user-model';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export default (userId) => {
  console.info('Listing expiring elements for user with id ' + userId);

  return elementsByUserModel.listExpiring(userId)
    .then(results => results.map(result => {
      let createdData = result.created_at.split('|');
      let isOwner = createdData.pop() === 'owner';

      // formatting
      let item = {
        id: result.id,
        status: result.ref_status,
        thumbnail_url: result.thumbnail_url,
        owner: isOwner,
        uploaded_at: (createdData.length === 3 ? createdData[1] : 'unknown')
      };

      return item;
    }))
    .then(items => ({ elements: items }));
};
