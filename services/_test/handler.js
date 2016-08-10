import { transfer } from './transfer';

const tasks = [
  // {
  //   source: 'dev-devices-by-users',
  //   dest: 'beta-devices-by-users'
  // },
  // {
  //   source: 'dev-elements',
  //   dest: 'beta-elements'
  // },
  // {
  //   source: 'dev-elements-by-users',
  //   dest: 'beta-elements-by-users'
  // },
  // {
  //   source: 'dev-feedback',
  //   dest: 'beta-feedback'
  // }, {
  //   source: 'dev-friends',
  //   dest: 'beta-friends'
  // },
  // {
  //   source: 'dev-notifications',
  //   dest: 'beta-notifications'
  // },
  // ,
  // {
  //   source: 'dev-subscribers',
  //   dest: 'beta-subscribers'
  // }, {
  //   source: 'dev-users',
  //   dest: 'beta-users'
  // },
  {
    source: 'dev-users-log',
    dest: 'beta-users-log'
  }
];

export default () => {
  return Promise.all(tasks.map(task => transfer(task.source, task.dest)));
};
