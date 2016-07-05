import { resizeImage } from './resize-image';

const SOURCE_DIR = '/Users/jlorie/Downloads/test-images';
const FILENAME = 'image-one.png';
const RESOLUTION = 1080;

export default () => {
  const sourceUrl = SOURCE_DIR + '/' + FILENAME;
  const destUrl = SOURCE_DIR + '/' + RESOLUTION + 'p-' + FILENAME;

  return resizeImage({ sourceUrl, destUrl, resolution: RESOLUTION });
};
