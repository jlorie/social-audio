import { cleanElementNotifications } from './clean';

export default (event, context) => {
  let input = event;
  console.info('=> Input: ', JSON.stringify(input, null, 2));
  return cleanElementNotifications(input.element_id, input.user_id, input.owner)
    .then((result) => {
      console.info('==> Success: ', result);
      return context.succeed(result);
    })
    .catch(err => {
      console.error('==> An error occurred. ', err.stack);
      return context.fail(err);
    });
};
