import im from 'imagemagick';
import Storage from '../commons/remote/storage';

const BUCKET_ELEMENTS_FILES = process.env.BUCKET_ELEMENTS_FILES;

export function resizeImage({ elementId, uri, resolution }) {
  console.info('Resizing image from ' + uri + 'with height: ' + resolution);

  return Storage.getFileData(uri)
    .then(fileData => resize(fileData.Body, resolution))
    .then(buffer => {
      let dest = `${BUCKET_ELEMENTS_FILES}/images/${resolution}p-${elementId}.jpg`;
      return Storage.uploadFile({ buffer, dest });
    });
}

function resize(imageBuffer, height) {
  let resizeOptions = {
    srcData: imageBuffer,
    height,
    quality: 0.82,
    format: 'jpg'
      // customArgs: config.resizeArgs
  };

  let func = (resolve, reject) => {
    im.resize(resizeOptions, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(new Buffer(data, 'binary'));
    });
  };

  return new Promise(func);
}
