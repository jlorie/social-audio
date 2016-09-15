import { SUCCESS, ERR_ACTION } from '../commons/constants';
import dynamoDoc from 'dynamo-doc';

const INSERT = 'INSERT';
const MODIFY = 'MODIFY';
const REMOVE = 'REMOVE';
const STAGE = process.env.SERVERLESS_STAGE;
const REGION = process.env.SERVERLESS_REGION;

export function processEvent(record) {
  let result;
  let input = {};
  let action = {};
  let eventArn = record.eventSourceARN.split('table/').pop();
  input.table = eventArn.split('/').shift();
  input.stage = STAGE;
  input.region = REGION;
  switch (record.eventName) {
    case INSERT:
      {
        action.eventName = INSERT;
        result = Promise.resolve(SUCCESS);
        break;
      }
    case MODIFY:
      {
        action.eventName = MODIFY;
        result = Promise.resolve(SUCCESS);
        break;
      }
    case REMOVE:
      {
        action.eventName = REMOVE;
        result = Promise.resolve(SUCCESS);
        break;
      }
    default:
      {
        action.eventName = 'Unfined Action';
        return Promise.resolve(ERR_ACTION.UNDEFINED);
      }
  }
  action.NewImage = dynamoDoc.dynamoToJs(record.dynamodb.NewImage);
  action.OldImage = dynamoDoc.dynamoToJs(record.dynamodb.OldImage);
  input.Records = [
    action
  ];
  console.info(JSON.stringify(input, null, 2));

  return result;
}
