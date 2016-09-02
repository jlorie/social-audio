import ResourceModel from '../commons/resources/resource-model';

export default () => {
  let created = '2016-07-18T19:37:53.228Z|owner';
  let [date, ...tail] = created.split('|');
  let owner = tail.pop();

  console.log('date: ', date);
  console.log('owner: ', owner);

  return 'OK';
};
