import im from './lib/imagemagick';
import fs from 'fs';

export function resizeImage({ sourceUrl, destUrl, resolution }) {
  console.info('Resizing image from ' + sourceUrl + ' with height: ' + resolution);

  return getData(sourceUrl)
    .then(fileData => resize(fileData, resolution))
    .then(buffer => saveData(buffer, destUrl));
}


function resize(imageBuffer, height) {
  let resizeOptions = {
    srcData: imageBuffer,
    height,
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

function getData(filePath) {
  let func = (resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  };

  return new Promise(func);
}

function saveData(buffer, dest) {
  let promise = (resolve, reject) => {
    fs.writeFile(dest, buffer, err => {
      if (err) {
        return reject(err);
      }

      return resolve('OK');
    });
  };

  return new Promise(promise);
}
