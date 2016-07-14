import Storage from '../commons/remote/storage';
import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

import { notifyNewAudio } from './notify-new-audio';
import { markRequestAsResolved } from './mark-notification';

const URI_ELEMENTS_RESOURCE = process.env.URI_ELEMENTS_RESOURCE;
const BUCKET_ELEMENT_FILES = process.env.BUCKET_ELEMENT_FILES;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementModel = new ElementModel(URI_ELEMENTS_RESOURCE);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function attach(attachment) {
  console.info('Persisting attachment with id ' + attachment.id);

  return saveAttachment(attachment)
    .then(attachmentUrl => {
      let attachmentData = {
        id: attachment.id,
        source_url: attachmentUrl,
        public: attachment.public,
        user_id: attachment.owner_id,
        created_at: new Date().toISOString()
      };

      console.info('Adding an attachment to element with id ' + attachment.attached_to);
      return elementModel.attachFile(attachment.attached_to, attachmentData);
    })
    .then(() => {
      let tasks = [
        bindElement(attachment.owner_id, attachment.attached_to),
        notifyNewAudio(attachment),
        markRequestAsResolved(attachment.owner_id, attachment.attached_to)
      ];

      return Promise.all(tasks);
    })
    .catch(err => {
      console.info(`An error occurred attaching. ${err}`);
      throw err;
    });
}

function saveAttachment(attachment) {
  console.info('Saving attachment ...');

  let prefix = `https://s3.amazonaws.com/${BUCKET_ELEMENT_FILES}`;
  let ext = attachment.source_url.split('.').pop();
  let destUrl = `${prefix}/${attachment.type}/attachment-${attachment.id}.${ext}`;

  return Storage.copyFile(attachment.source_url, destUrl)
    .then(() => destUrl);
}

function bindElement(userId, elementId) {
  console.info('Binding element ' + elementId + ' with user ' + userId);

  let data = {
    ref_status: REF_STATUS.RESOLVED
  };

  // bind user with element
  return elementsByUserModel.update(elementId, userId, data);
}
