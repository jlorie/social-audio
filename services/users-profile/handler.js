import { detailProfile } from './detail-profile';

export default (event, context) => {
  let input = event;
  console.info('=> Input: ', JSON.stringify(input, null, 2));

  let userId = input.identity_id.split(':').pop();

  return detailProfile(userId)
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      let error = {
        status: 'ERROR',
        message: err.message
      };
      context.fail(JSON.stringify(error));
    });
};
