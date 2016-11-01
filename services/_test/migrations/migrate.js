import migrateInvitations from './invitations';

export default () => {
  let tasks = [
    migrateInvitations()
  ];

  return Promise.all(tasks)
    .catch(err => {
      console.info('An error ocurred: ', err);
    });
};
