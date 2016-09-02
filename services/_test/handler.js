import ResourceModel from '../commons/resources/resource-model';

const model = new ResourceModel('testing');

function put(data) {
  return model.create(data);
}

export default () => {
  let inputs = [{
      id: '9996b537aeddb97bdad5c64afb505f4c',
      user_id: 'c6db8888-cfc5-4e4a-b130-80409469d21a',
      created_at: '2016-07-18T19:37:53.228Z|owner',
      thumbnail_url: 'https://s3.amazonaws.com/dev-bbluue-files/images/480p-9996b537aeddb97bdad5c64afb505f4c.jpg',
      favorite: false,
      ref_status: 'resolved'
    },
    {
      id: '30af42b328c1b1cafb44676fa90a51b7',
      user_id: 'c6db8888-cfc5-4e4a-b130-80409469d21a',
      created_at: '2016-07-18T19:37:53.228Z|owner',
      thumbnail_url: 'https://s3.amazonaws.com/dev-bbluue-files/images/480p-30af42b328c1b1cafb44676fa90a51b7.jpg',
      favorite: false,
      ref_status: 'resolved'
    }
  ];

  return Promise.all(inputs.map(put))
    .then(response => {
      console.info('==> Success: ', JSON.stringify(response));
      return response;
    })
    .catch(err => {
      console.info('==> Error: ', JSON.stringify(err));
    });
};
