import uuid from 'node-uuid';
import FeedbackModel from '../commons/resources/feedback-model';

const URI_FEEDBACKS = process.env.URI_FEEDBACKS;
const feedbackModel = new FeedbackModel(URI_FEEDBACKS);

export function register(userId, text) {
  let feedbackData = {
    id: uuid.v1(),
    user_id: userId,
    created_at: new Date().toISOString(),
    text
  };

  return feedbackModel.create(feedbackData);
}
