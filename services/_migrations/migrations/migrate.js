import migrateInvitations from './invitations';
import fixPendingStatus from './fix-pending-status';

export default () => {
  let tasks = [
    // migrateInvitations(),
    fixPendingStatus()
  ];

  return Promise.all(tasks)
    .catch(err => {
      console.info('An error ocurred: ', err);
    });
};
