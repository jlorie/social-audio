import { createLog } from './log';
import { extractObjectFromSNSMessage } from '../commons/helpers/utils';

export default (event, context) => {
  const input = extractObjectFromSNSMessage(event);
  console.info('==> Input LOG: ', JSON.stringify(input));
  const sns = event.Records[0].Sns;
  let data = {
    userId: input.id,
    topicArn: sns.TopicArn
  };
  console.info(' El data que se manda es ' + JSON.stringify(data, null, 2));
  return createLog(data).then((result) => {
      console.info('==> Success: ', result);
      return context.succeed(result);
    })
    .catch(err => {
      console.error('==> An error occurred. ', err.stack);
      return context.fail(err);
    });
};
