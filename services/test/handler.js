// import ResourceModel from '../commons/resources/resource-model';
// const users = new ResourceModel('test-table-2');
import uuid from 'node-uuid';

export default (event, context) => {
  console.log('uuid: ' + uuid.v1());
  context.succeed('done!');
  // let params = {
  //   start: '777888999',
  //   limit: 1,
  //   query: {
  //     age: 28
  //   }
  // };
  //
  // return users.get(params)
  //   .then(result => {
  //     console.warn('==> Result: ', JSON.stringify(result, null, 2));
  //     return result;
  //   })
  //   .catch(err => {
  //     console.error('==> Error: ', err);
  //     throw err;
  //   });
};
