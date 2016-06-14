import { extractObjectFromS3Message, generateUrlFromArgs } from '../commons/helpers/utils';

import { optimizeImage } from './optimize-image';
import { updateProfilePicture } from './user-profile';

export default (event, context) => {
  const { username, bucket, key } = extractObjectFromS3Message(event);
  let sourceUrl = generateUrlFromArgs(bucket, key);

  return optimizeImage(sourceUrl)
    .then(sourceUrl => updateProfilePicture(username, sourceUrl))
    // results
    .then((result) => {
      console.info('==> Success: ', result);
      return context.succeed(result);
    })
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);
      return context.fail(err);
    });
};
