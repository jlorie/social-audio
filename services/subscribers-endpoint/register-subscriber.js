import SubscriberModel from '../commons/resources/subscriber-model';
import { SUCCESS } from '../commons/constants';

const URI_SUBSCRIBERS = process.env.URI_SUBSCRIBERS;
const subscriberModel = new SubscriberModel(URI_SUBSCRIBERS);

export function register(email) {
  let feedbackData = {
    email,
    created_at: new Date().toISOString()
  };

  return subscriberModel.create(feedbackData)
    .then(() => SUCCESS)
    .catch(err => {
      if (err.code === 'ConditionalCheckFailedException') {
        return {
          status: 'FAILED',
          message: 'DuplicatedData'
        };
      }

      throw err;
    });
}
