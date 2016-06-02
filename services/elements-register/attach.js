import ElementModel from '../commons/resources/element-model';
import Storage from '../commons/remote/storage';

const URI_ELEMENTS_RESOURCE = process.env.URI_ELEMENTS_RESOURCE;
const BUCKET_ELEMENT_FILES = process.env.BUCKET_ELEMENT_FILES;

const elementModel = new ElementModel(URI_ELEMENTS_RESOURCE);

export function attach(attachment) {
  console.info('Persisting attachment with id ' + attachment.id);
  return saveAttachment(attachment)
    .then(attachmentUrl => {
      let attachmentData = {
        id: attachment.id,
        source_url: attachmentUrl,
        public: attachment.public,
        user_id: attachment.owner_id
      };

      console.warn('Adding an attachment to element with id ' + attachment.attached_to);
      return elementModel.attachFile(attachment.attached_to, attachmentData);
    })
    .catch(err => {
      console.error(`An error occurred attaching. ${err}`);
      throw err;
    });
}

function saveAttachment(attachment) {
  console.warn('Saving attachment ...');

  let prefix = `https://s3.amazonaws.com/${BUCKET_ELEMENT_FILES}`;
  let ext = attachment.source_url.split('.').pop();
  let destUrl = `${prefix}/${attachment.type}/attachment-${attachment.id}.${ext}`;

  return Storage.copyFile(attachment.source_url, destUrl)
    .then(() => destUrl);
}
