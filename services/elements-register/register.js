import Storage from '../commons/remote/storage';
import ElementModel from '../commons/resources/element-model';

import { generateUrlFromArgs } from '../commons/helpers/utils';
import { attach } from './attach';
import { shareElement } from './share-element';

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

  const meta = fileInfo.Metadata;
  const metadata = {
    id: fileInfo.ETag.replace(/"/g, ''), // remove extra "
    owner_id: meta.user_id,
    location_info: {
      coordinates: [meta.latitude, meta.longitude],
      address: meta.address
    },
    created_at: formatDate(meta.created_at),
    type: fileInfo.ContentType.split('/')[0],
    attached_to: meta.attached_to,
    public: meta.public,
    source_url: fileInfo.url,
    modified_at: new Date().toISOString(),
    share_with: meta.share_with
  };

  if (!metadata.owner_id) {
    throw new Error('Invalid parameters');
  }

  return metadata;
}

function createElement(elementInfo) {
  if (elementInfo.attached_to) {
    return attach(elementInfo);
  }

  console.info('Registering new element ...');
  return elementModel.create(elementInfo)
    .then(newElement => {
      console.info('==> New Element: ', JSON.stringify(newElement, null, 2));

      // share
      if (elementInfo.share_with) {
        let shareWith = elementInfo.share_with.replace(/\s/g, '');
        let usernames = shareWith.split(',');
        return shareElement(newElement.owner_id, newElement.id, usernames);
      }
    });
}

function formatDate(date) {
  let newDate = (date ? new Date(date) : new Date());
  return newDate.toISOString();
}
