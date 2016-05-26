import Storage from '../commons/remote/storage';
import ElementModel from '../commons/resources/element-model';

import { generateUrlFromArgs } from '../commons/helpers/utils';
import { attach } from './attach';

const URI_ELEMENTS_RESOURCE = process.env.URI_ELEMENTS_RESOURCE;

const elementModel = new ElementModel(URI_ELEMENTS_RESOURCE);

export function register({ bucket, key }) {
  console.info('Getting file info for ' + key);

  return Storage.fileInfo(bucket, key)
    .then(fileInfo => {
      fileInfo.url = generateUrlFromArgs(bucket, key);
      return extractMetadata(fileInfo);
    })
    .then(createElement)
    .catch(err => {
      console.error('An error occurred registering element. ' + err);
      throw err;
    });
}

function extractMetadata(fileInfo) {
  console.info('Extracting metadata from file ...');

  const metadata = {
    original_md5: fileInfo.ETag.replace(/"/g, ''), // remove extra "
    user_id: fileInfo.Metadata.user_id,
    longitude: fileInfo.Metadata.longitude,
    latitude: fileInfo.Metadata.latitude,
    created_at: fileInfo.Metadata.created_at,
    type: fileInfo.ContentType.split('/')[0],
    attached_to: fileInfo.Metadata.attached_to,
    source_url: fileInfo.url,
    modified_at: new Date().toISOString()
  };

  return metadata;
}

function createElement(elementInfo) {
  if (elementInfo.attached_to) {
    console.info('Adding attachment to element with md5 ' + elementInfo.original_md5);
    return attach(elementInfo);
  }

  console.info('Registering new element ...');
  return elementModel.create(elementInfo);
}