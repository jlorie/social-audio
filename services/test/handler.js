import ElementModel from '../commons/resources/element-model';
const elements = new ElementModel('dev-elements');

export default (event, context) => {
  let userId = '0a73b017-e66c-4a41-bc58-ff4eb3e81db3';
  let query = {
    original_md5: 'f938cb14436898972b08f8ca88f9738e'
  };

  return elements.get({ userId, query })
    .then(result => {
      console.warn('==> Result: ', JSON.stringify(result, null, 2));
      return result;
    })
    .catch(err => {
      console.error('==> Error: ', err);
      throw err;
    });
};
