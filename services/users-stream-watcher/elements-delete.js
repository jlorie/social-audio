import Storage from '../commons/remote/storage';
import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';
import { ERR_ELEMENTS, NOTHING_TO_DO } from '../commons/constants';

const OWNER = 'owner';
const GUEST = 'visitor';

const URI_ELEMENTS = process.env.URI_ELEMENTS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const elementModel = new ElementModel(URI_ELEMENTS);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function deleteElementsFor(userId) {
  // TODO delete profile picture

  // getting references
  return elementsByUserModel.get({ userId })
    .then(references => {
      let owned = references.items.filter(e => e.created_at.endsWith(OWNER));
      let guest = references.items.filter(e => e.created_at.endsWith(GUEST));

      return Promise.all([removeOwnedElements(owned), cleanGuestReferences(guest)]);
    });
}

function removeOwnedElements(references) {
  console.info(`Deleting elements ${references.length}`);

  let elementIds = references.map(e => e.id);
  return elementModel.batchRemove(elementIds);
}

function cleanGuestReferences(references) {
  console.info(`Cleaning attachments in ${references.length}  referenced elements`);
  return Promise.all(references.map(checkAttachments))
    .then(() => {
      // remove guest references
      let keys = references.map(r => ({
        user_id: r.user_id,
        created_at: r.created_at
      }));

      return elementsByUserModel.batchRemove(keys);
    });
}

function checkAttachments(reference) {
  let elementId = reference.id;

  return elementModel.getById(elementId)
    .then(element => {
      if (!element) {
        throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
      }

      element.audios = element.audios || [];
      let expiredAudios = element.audios.map((audio, index) => {
        let audioUrl = audio.source_url;
        // delete record
        element.audios.splice(index, 1);
        return audioUrl;
      });

      let isEmpty = expiredAudios.length === 0;
      if (isEmpty) {
        return Promise.resolve(NOTHING_TO_DO);
      }

      // update element audios
      console.info(`Removed ${expiredAudios.length} expired audios in element ${elementId}`);
      return elementModel.update(elementId, { audios: element.audios })
        .then(() => deleteAudioFiles(expiredAudios));
    });
}

function deleteAudioFiles(uris) {
  console.info('Deleting ' + uris.length + ' files');
  return Storage.batchRemoveFiles(uris);
}
