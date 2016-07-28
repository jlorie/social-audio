import AudioModel from '../commons/resources/audio-model';

const tableName = 'dev-elements';
const audioModel = new AudioModel(tableName);

const input = {
  element_id: '3b5b6b654c30bd11b3b2a1e4622514e9',
  audios: [{
    id: '6ae0df1e36fcf66eca14e1643fa67ff0',
    playbacks: 1
  }]
};

export default () => {
  return audioModel.updatePlaybacks(input.element_id, input.audios);
};
