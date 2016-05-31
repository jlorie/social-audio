import ElementModel from '../commons/resources/element-model';
import Storage from '../commons/remote/storage';

const URI_ELEMENTS_RESOURCE = process.env.URI_ELEMENTS_RESOURCE;
const BUCKET_ELEMENT_FILES = process.env.BUCKET_ELEMENT_FILES;

const elementModel = new ElementModel(URI_ELEMENTS_RESOURCE);

export function attach(attachment) {
  console.info('Adding attachment to element with md5 ' + attachment.original_md5);

  return getSourceElement({ userId: attachment.user_id, md5: attachment.attached_to })
    .then(source => {
      console.warn('Attaching to element with id ' + source.id);
      return saveAttachment({ attachment, source })
        .then(attachmentUrl => {
          let attachmentData = {
            type: attachment.type,
            source_url: attachmentUrl,
            md5: attachment.original_md5,
            public: attachment.public,
            user_id: attachment.user_id
          };

          console.warn('Adding an attachment to element with id ' + source.id);
          return elementModel.attachFile(source.id, attachmentData);
        });
    })
    .catch(err => {
      console.error(`An error occurred attaching. ${err}`);
      throw err;
    });
}

function getSourceElement({ userId, md5 }) {
  console.warn('Getting source element data ...');
  let filters = {
    original_md5: md5
  };

  return elementModel.get({ userId, filters })
    .then(results => {
      let element = results.items[0];
      if (!element) {
        throw new Error(`Source element with md5 ${md5} not found. `);
      }

      return element;
    });
}

function saveAttachment({ attachment, source }) {
  console.warn('Saving attachment ...');

  let prefix = `https://s3.amazonaws.com/${BUCKET_ELEMENT_FILES}`;
  let ext = attachment.source_url.split('.').pop();
  let destUrl = `${prefix}/${attachment.type}/attachment-${source.original_md5}.${ext}`;

  console.warn('==> destUrl: ' + destUrl);
  return Storage.copyFile(attachment.source_url, destUrl)
    .then(() => destUrl);
}
