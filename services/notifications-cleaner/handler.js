import { cleanElementNotifications, cleanAudioNotifications } from './clean';

const STAGE = process.env.SERVERLESS_STAGE;

export default (event, context) => {
  let input = event;
  input.stage = STAGE;
  console.info('=> Input: ', JSON.stringify(input, null, 2));

  // determine promise
  let promise;
  if (input.audio_id) {
    promise = cleanAudioNotifications(input.element_id, input.audio_id);
  } else {
    promise = cleanElementNotifications(input.element_id, input.user_id, input.owner);
  }

  return promise
    .then(result => {
      console.info('==> Success: ', result);
      return context.succeed(result);
    })
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);
      return context.fail(err);
    });
};
