const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
const { extractArgsFromUrl } = require('../helpers/utils');

class Storage {

  static uploadFile({ buffer, filePath, destUrl }) {
    const args = extractArgsFromUrl(destUrl);

    return getData({ buffer, filePath })
      .then(data => {
        let func = (resolve, reject) => {
          s3.putObject({
            Bucket: args.bucket,
            Key: args.key,
            Body: data
          }, err => {
            if (err) {
              reject(err);
            }

            resolve(destUrl);
          });
        };

        return new Promise(func);
      });
  }

  static getFileData(sourceUrl) {
    // Splitting url to get bucket and key
    let args = extractArgsFromUrl(sourceUrl);

    let func = (resolve, reject) => {
      s3.getObject({
        Bucket: args.bucket,
        Key: args.key

      }, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    };

    return new Promise(func);
  }

  static downloadFile(sourceUrl, destination, callback) {
    let data = extractArgsFromUrl(sourceUrl);
    const params = {
      Bucket: data.bucket,
      Key: data.key
    };

    let file = fs.createWriteStream(destination);
    let stream = s3.getObject(params).createReadStream().pipe(file);
    stream.on('finish', () => {
      callback(null, 'success');
    });

    stream.on('error', (err) => {
      callback(err);
    });
  }

  static signUrl(url, timeToExpire = 900) {
    let result = (resolve, reject) => {
      const s3FileInfo = extractArgsFromUrl(url);
      let params = {
        Bucket: s3FileInfo.bucket,
        Key: s3FileInfo.key,
        Expires: timeToExpire
      };

      s3.getSignedUrl('getObject', params, (err, signedUrl) => {
        if (err) {
          return reject(err);
        }

        resolve(signedUrl);
      });
    };

    return new Promise(result);
  }

  static copyFile(sourceUrl, destUrl) {
    const sourceParams = extractArgsFromUrl(sourceUrl);
    const destParams = extractArgsFromUrl(destUrl);

    let result = (resolve, reject) => {
      s3.copyObject({
        Bucket: destParams.bucket,
        Key: destParams.key,
        CopySource: [sourceParams.bucket, sourceParams.key].join('/')

      }, (err) => {
        if (err) {
          return reject(err);
        }

        resolve(destUrl);
      });
    };

    return new Promise(result);
  }

  static fileInfo(bucket, key) {
    return new Promise((resolve, reject) => {
      s3.headObject({
        Bucket: bucket,
        Key: key
      }, (err, info) => {
        if (err) {
          return reject(err);
        }

        resolve(info);
      });
    });
  }

  static batchRemoveFiles(uris) {
    let params = {
      Bucket: extractArgsFromUrl(uris[0]).bucket,
      Delete: {
        Objects: uris.map(uri => ({ Key: extractArgsFromUrl(uri).key }))
      }
    };

    let promise = (resolve, reject) => {
      s3.deleteObjects(params, err => {
        if (err) {
          return reject(err);
        }

        resolve('success');
      });
    };

    return new Promise(promise);
  }

}

function getData({ buffer, filePath }) {
  let func = (resolve, reject) => {
    if (buffer) {
      return resolve(buffer);
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  };

  return new Promise(func);
}

module.exports = Storage;
