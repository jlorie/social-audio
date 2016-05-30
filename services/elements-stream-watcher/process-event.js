import Notification from '../commons/remote/notification';
import dynamoDoc from 'dynamo-doc';

const INSERT = 'INSERT';
const TOPIC_REGISTERED_ELEMENT = process.env.TOPIC_REGISTERED_ELEMENT;

const newElementNotify = new Notification(TOPIC_REGISTERED_ELEMENT);

export function processEvent(record) {
  let result;
  switch (record.eventName) {
    case INSERT:
      {
        let message = dynamoDoc.dynamoToJs(record.dynamodb.NewImage);
        result = newElementNotify.notify(JSON.stringify(message));
        break;
      }
    default:
      {
        return 'Undefined action';
      }
  }

  return result;
}
