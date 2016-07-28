import AudioModel from '../commons/resources/audio-model';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const audioModel = new AudioModel(URI_ELEMENTS);


export default (event) => {
  return updatePlaybaks(event);
};

function updatePlaybaks({ elementId, audioPlaybacks }) {
  console.info(`Updating playbacks for element ${elementId}`);
  return audioModel.updatePlaybacks(elementId, audioPlaybacks);
}
