import ResourceModel from '../commons/resources/resource-model';

const users = new ResourceModel('test-table');
export default (event, context) => {

  let data = {
    username: 'jlorie',
    age: 18,
    created_at: new Date()
  };

  return users.create(data)
    .then(result => {
      console.log('==> Result: ', JSON.stringify(result, null, 2));
      return result;
    })
    .catch(err => {
      console.log('==> Error: ', err);
      throw err;
    });
}
