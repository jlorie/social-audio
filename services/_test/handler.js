import SubscriberModel from '../commons/resources/subscriber-model';

const tableName = 'dev-subscribers';
const subscriberModel = new SubscriberModel(tableName);

export default () => {
  let data = {
    email: 'jlorie@bbluue.com',
    created_at: new Date().toISOString()
  };

  return subscriberModel.create(data)
    .catch(err => {
      if (err.ConditionalCheckFailedException) {
        throw new Error('DuplicatedData');
      }
    });
};
