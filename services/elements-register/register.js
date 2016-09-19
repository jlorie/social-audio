import Storage from '../commons/remote/storage';
import ElementModel from '../commons/resources/element-model';
import { ERR_ELEMENTS } from '../commons/constants';

import { generateUrlFromArgs } from '../commons/helpers/utils';
import { attach } from './attach';
import { shareElement } from './share-element';
import { optimizeImage } from './optimize-image';

const YES = 'yes';
const URI_ELEMENTS_RESOURCE = process.env.URI_ELEMENTS_RESOURCE;

const elementModel = new ElementModel(URI_ELEMENTS_RESOURCE);

export function register({ userId, bucket, key }) {
  console.info('Getting file info for ' + key);

  return Storage.fileInfo(bucket, key)
    .then(fileInfo => {
      fileInfo.url = generateUrlFromArgs(bucket, key);
      fileInfo.user_id = userId;
      return extractMetadata(fileInfo);
    })
    .then(createElement)
    .catch(err => {
      console.info('An error occurred registering element. ' + err);
      throw err;
    });
}

function extractMetadata(fileInfo) {
  console.info('Extracting metadata from file ...');

  const meta = fileInfo.Metadata;
  const metadata = {
    id: fileInfo.ETag.replace(/"/g, ''), // remove extra "
    owner_id: fileInfo.user_id,
    location_info: {
      coordinates: [meta.latitude, meta.longitude],
      address: meta.address
    },
    created_at: formatDate(meta.created_at),
    type: fileInfo.ContentType.split('/')[0],
    attached_to: meta.attached_to,
    public: meta.public === YES,
    source_url: fileInfo.url,
    share_with: meta.share_with
  };

  if (!metadata.owner_id) {
    throw new Error('Invalid parameters');
  }

  return metadata;
}

function createElement(elementInfo) {
  if (elementInfo.attached_to) {
    if (elementInfo.type !== 'audio') {
      return Promise.resolve(ERR_ELEMENTS.InvalidAttachmentFormat);
    }

    return attach(elementInfo);
  }

  if (elementInfo.type !== 'image') {
    return Promise.resolve(ERR_ELEMENTS.InvalidElementFormat);
  }

  console.info('Registering new element ...');
  let element = formatElement(elementInfo);
  return exists(element.id)
    .then((elementExists) => {
      if (elementExists) {
        throw new Error(ERR_ELEMENTS.ALREADY_EXISTS);
      }

      return optimizeImage(element.source_url, element.id);
    })
    .then(images => {
      element.source_url = images.sourceUrl;
      element.thumbnail_url = images.thumbnailUrl;

      return elementModel.create(element);
    })
    .then(resultElement => {
      console.info('==> New Element: ', JSON.stringify(resultElement, null, 2));

      // share
      if (elementInfo.share_with) {
        let shareWith = elementInfo.share_with.replace(/\s/g, '');
        let usernames = shareWith.split(',');
        return shareElement(resultElement.owner_id, resultElement.id, usernames);
      }
    });
}

function formatDate(date) {
  let newDate = (date ? new Date(date) : new Date());
  return newDate.toISOString();
}

function formatElement(info) {
  let element = {
    created_at: info.created_at,
    id: info.id,
    location_info: info.location_info,
    modified_at: new Date().toISOString(),
    owner_id: info.owner_id,
    source_url: info.source_url,
    type: info.type
  };

  if (info.thumbnail_url) {
    element.thumbnail_url = info.thumbnail_url;
  }

  return element;
}

function exists(id) {
  return elementModel.getById(id)
    .then(element => {
      if (element) {
        return true;
      }

      return false;
    });
}
