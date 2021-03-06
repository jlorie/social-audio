import Notification from '../commons/remote/notification';
import dynamoDoc from 'dynamo-doc';

import { bind, update, remove } from './elements-users-binding';
import { addUserSpace, substractUserSpace, updateUserSpace } from './disk-space-calculator';

const INSERT = 'INSERT';
const MODIFY = 'MODIFY';
const REMOVE = 'REMOVE';

const TOPIC_REGISTERED_ELEMENT = process.env.TOPIC_REGISTERED_ELEMENT;

const newElementNotify = new Notification(TOPIC_REGISTERED_ELEMENT);

export function processEvent(record) {
  let result;
  switch (record.eventName) {
    case INSERT:
      {
        let element = dynamoDoc.dynamoToJs(record.dynamodb.NewImage);
        let tasks = [
          bind(element), // bind user with element
          newElementNotify.notify(JSON.stringify(element)), // notify new element
          addUserSpace(element) // adding user space
        ];

        result = Promise.all(tasks);
        break;
      }
    case MODIFY:
      {
        let oldImage = dynamoDoc.dynamoToJs(record.dynamodb.OldImage);
        let newImage = dynamoDoc.dynamoToJs(record.dynamodb.NewImage);
        let tasks = [
          update(oldImage, newImage), // updating element
          updateUserSpace(newImage, oldImage)
        ];
        result = Promise.all(tasks);
        break;
      }
    case REMOVE:
      {
        let oldImage = dynamoDoc.dynamoToJs(record.dynamodb.OldImage);
        let tasks = [
          remove(oldImage.id), // remove relationships
          substractUserSpace(oldImage) // removing user space,
        ];

        result = Promise.all(tasks);
        break;
      }
    default:
      {
        return new Promise(resolve => resolve('UndefinedAction'));
      }
  }

  return result;
}
