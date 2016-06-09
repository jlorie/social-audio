import im from 'imagemagick';
import Storage from '../commons/remote/storage';

export function resizeImage({ sourceUrl, destUrl, resolution }) {
  console.info('Resizing image from ' + sourceUrl + ' with height: ' + resolution);

  return Storage.getFileData(sourceUrl)
    .then(fileData => resize(fileData.Body, resolution))
    .then(buffer => Storage.uploadFile({ buffer, destUrl }));
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
