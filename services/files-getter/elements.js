import { sign } from './url-sign';
import { IMAGES_RES } from '../commons/constants';

const MEDIA_URL = process.env.MEDIA_URL;
const OPTION_STANDARD = 'standard';
const OPTION_THUMB = 'thumb';

export function getElementUrl(userId, id, option = OPTION_STANDARD) {
  // check user persmissions
  let resolution = IMAGES_RES.STANDARD;
  if (option === OPTION_THUMB) {
    resolution = IMAGES_RES.THUMB;
  }

  return sign(MEDIA_URL + '/images/' + resolution + 'p-' + id + '.jpg');
}
