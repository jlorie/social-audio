import GeneralConfig from '../commons/resources/general-config';
import ElementModel from '../commons/resources/element-model';
import Storage from '../commons/remote/storage';

const config = new GeneralConfig();
const elementModel = new ElementModel('dev-elements');
export default (event, context) => {
  let ids = ['f8542965c3e42011a48188e1bb4d3882', 'ab49cd6e04b396baeab0af0099bb425e',
    // '3c0356258da794eeff9b7f2240633268', 'c12f95c8147118dafbd3a8ff25472b17',
    '3014e74816a701066cb44be74a6cf7a2'
  ];
  return getElements(ids);
};

function getElements(ids) {
  return elementModel.batchRemove(ids)
    .then(elements => {
      console.log('==> results: ', JSON.stringify(elements, null, 2));
      return elements;
    });
}
