import { removeExpiredUsers } from './remove-expired-users';
import { disableInactiveUsers } from './disable-inactive-users';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event) => {
  let input = event;
  input.stage = STAGE;
  console.info('Input: ', JSON.stringify(input, null, 2));

  let tasks = [
    removeExpiredUsers(),
    disableInactiveUsers()
  ];

  return Promise.all(tasks)
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      return result;
    })
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);
      throw err;
    });
};
