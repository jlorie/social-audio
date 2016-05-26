import ElementModel from '../commons/resources/element-model';
import Storage from '../commons/remote/storage';

const URL_RESOURCES_API = process.env.URL_RESOURCES_API;
const BUCKET_ELEMENT_FILES = process.env.BUCKET_ELEMENT_FILES;

const elementModel = new ElementModel(URL_RESOURCES_API);

export function attach(attachment) {
  return getSourceElement({ userId: attachment.user_id, md5: attachment.attached_to })
    .then(source => {
      console.warn('Attaching to element with id ' + source._id);
      return saveAttachment({ attachment, source })
        .then(attachmentUrl => {
          let attachmentData = {
            type: attachment.type,
            source_url: attachmentUrl,
            md5: attachment.original_md5
          };

          console.warn('Adding an attachment to element with id ' + source._id);
          elementModel.attachFile(source._id, attachmentData);
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
    user_id: userId,
    original_md5: md5
  };

  return elementModel.get(filters)
    .then(results => {
      let element = results[0];
      if (!element) {
        throw new Error(`Source element with md5 ${md5} not found. `);
      }

      return element;
    });
}

function saveAttachment({ attachment, source }) {
  console.warn('Saving attachment ...');

  let prefix = `https://s3.amazonaws.com/${BUCKET_ELEMENT_FILES}`;
  let ext = attachment.tmp_url.split('.').pop();
  let destUrl = `${prefix}/${attachment.type}/attachment-${source.original_md5}.${ext}`;

  console.warn('==> destUrl: ' + destUrl);
  return Storage.copyFile(attachment.tmp_url, destUrl)
    .then(() => destUrl);
}
