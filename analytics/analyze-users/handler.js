import fecth from './fetch';
import analyze from './analyze';
import save from './save';

export default (event, context) => {
  return fecth()
    .then(analyze)
    .then(save);
};
