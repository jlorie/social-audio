'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
const { extractArgsFromUrl, generateUrlFromArgs } = require('../helpers/utils');

class Storage {

  static uploadFile(filePath, dest, callback) {
    // NOTE dest format: bucket/key
    const bucket = dest.split('/').slice(0, 1)[0];
    const key = dest.split('/').slice(1).join('/');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        return callback(err);
      }

      s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: data

      }, (error) => {
        if (error) {
          return callback(error);
        }

        return callback(null, generateUrlFromArgs(bucket, key));
      });
    });
  }

  static getFileData(sourceUrl, callback) {
    // Splitting url to get bucket and key
    let arr = sourceUrl.split('/');

    s3.getObject({
      Bucket: arr[3],
      Key: arr[4]

    }, (err, data) => {
      if (err) {
        console.error('An error ocurred while getting file from ', sourceUrl);
        return callback(err);
      }

      callback(null, data);
    });
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

  static signUrl(url) {
    let result = (resolve, reject) => {
      const s3FileInfo = extractArgsFromUrl(url);
      let params = {
        Bucket: s3FileInfo.bucket,
        Key: s3FileInfo.key
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

}

module.exports = Storage;
