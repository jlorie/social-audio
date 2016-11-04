import uuid from 'node-uuid';
import Storage from '../commons/remote/storage';
import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS, ERR_ELEMENTS } from '../commons/constants';

import { notifyNewAudio } from './notify-new-audio';
import { markRequestAsResolved } from './mark-notification';
import { generateUrlFromArgs } from '../commons/helpers/utils';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const BUCKET_ELEMENT_FILES = process.env.BUCKET_ELEMENT_FILES;
const BUCKET_ELEMENT_UPLOAD = process.env.BUCKET_ELEMENT_UPLOAD;

const elementModel = new ElementModel(URI_ELEMENTS);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export default (userId, elementId, data) => {
  if (!data.path) {
    throw new Error(ERR_ELEMENTS.INVALID_PATH);
  }

  const audioId = uuid.v1();
  console.info(`Attaching audio with id ${audioId} to element ${elementId}`);

  return saveAttachment(audioId, data.path)
    .then(attachmentUrl => {
      let attachment = {
        id: audioId,
        source_url: attachmentUrl,
        public: data.public || true,
        user_id: userId,
        created_at: new Date().toISOString()
      };

      return elementModel.attachFile(elementId, attachment).then(() => attachment);
    })
    .then(attachment => {
      let tasks = [
        notifyNewAudio(attachment, elementId),
        bindElement(userId, elementId),
        markRequestAsResolved(userId, elementId)
      ];

      return Promise.all(tasks).then(() => attachment);
    })
    .catch(err => {
      console.info(`An error occurred attaching. ${err}`);
      throw err;
    });
};

function saveAttachment(id, path) {
  console.info('Saving attachment ...');

  const ext = path.split('.').pop();
  const destKey = `audio/attachment-${id}.${ext}`;
  const destUrl = generateUrlFromArgs(BUCKET_ELEMENT_FILES, destKey);
  const sourceUrl = generateUrlFromArgs(BUCKET_ELEMENT_UPLOAD, path);

  return Storage.copyFile(sourceUrl, destUrl).then(() => destUrl);
}

function bindElement(userId, elementId) {
  console.info('Binding element ' + elementId + ' with user ' + userId);

  let data = {
    ref_status: REF_STATUS.RESOLVED
  };

  // bind user with element
  return elementsByUserModel.update(elementId, userId, data, ['expire_at']);
}
