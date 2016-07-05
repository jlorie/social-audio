import im from './lib/imagemagick';
import Storage from '../commons/remote/storage';

export function resizeImage({ sourceUrl, destUrl, resolution }) {
  console.info('Resizing image from ' + sourceUrl + ' with height: ' + resolution);

  return Storage.getFileData(sourceUrl)
    .then(fileData => resize(fileData.Body, resolution))
    .then(buffer => Storage.uploadFile({ buffer, destUrl }));
}


function resize(imageBuffer, resolution) {
  let resizeOptions = {
    srcData: imageBuffer,
    width: resolution,
    height: resolution,
    shrink: true,
    quality: 0.75,
    format: 'jpg'
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
