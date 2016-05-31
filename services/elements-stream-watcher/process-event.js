import Notification from '../commons/remote/notification';
import dynamoDoc from 'dynamo-doc';

import { bind, update } from './elements-users-binding';

const INSERT = 'INSERT';
const MODIFY = 'MODIFY';
const TOPIC_REGISTERED_ELEMENT = process.env.TOPIC_REGISTERED_ELEMENT;

const newElementNotify = new Notification(TOPIC_REGISTERED_ELEMENT);

export function processEvent(record) {
  let result;
  switch (record.eventName) {
    case INSERT:
      {
        let element = dynamoDoc.dynamoToJs(record.dynamodb.NewImage);
        let tasks = [bind(element), // bind user with element
          newElementNotify.notify(JSON.stringify(element)) // notify new element
        ];

        result = Promise.all(tasks);
        break;
      }
    case MODIFY:
      {
        let oldImage = dynamoDoc.dynamoToJs(record.dynamodb.OldImage);
        let newImage = dynamoDoc.dynamoToJs(record.dynamodb.NewImage);
        result = update(oldImage, newImage);
        break;
      }
    default:
      {
        return 'Undefined action';
      }
  }

  return result;
}
