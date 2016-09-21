import ElementUserModel from '../commons/resources/element-user-model';

const elementsByUsers = new ElementUserModel('dev-elements-by-users');

export default () => {
  const userId = '07484310-0a1a-48e0-b9c7-28257150f04a';
  const elementId = '724886048676f3b50d5547ac3d04a61b';

  return elementsByUsers.update(elementId, userId, { ref_status: 'pending' });
};
