import AudioModel from '../commons/resources/audio-model';
import { EMPTY } from '../commons/constants';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const audioModel = new AudioModel(URI_ELEMENTS);


export default (event) => {
  console.info('==> Event: ', JSON.stringify(event, null, 2));
  return updatePlaybaks(event);
};

function updatePlaybaks({ elementId, audioPlaybacks }) {
  let isEmpty = audioPlaybacks.length === 0;
  if (isEmpty) {
    return Promise.resolve(EMPTY);
  }

  console.info(`Updating playbacks for element ${elementId}`);
  return audioModel.updatePlaybacks(elementId, audioPlaybacks);
}
