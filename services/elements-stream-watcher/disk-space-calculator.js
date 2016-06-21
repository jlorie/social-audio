import Storage from '../commons/remote/storage';
import UserModel from '../commons/resources/user-model';
import { ERR_USERS } from '../commons/constants';

const URI_USERS = process.env.URI_USERS;
const userModel = new UserModel(URI_USERS);

import { extractArgsFromUrl } from '../commons/helpers/utils';

export function addUserSpace(element) {
  console.info('Adding element space to user ' + element.owner_id);
  return calculateElementSpace(element)
    .then(sizeInBytes => {
      console.info(`Adding ${sizeInBytes} bytes to user ` + element.owner_id);

      return userModel.getById(element.owner_id)
        .then(user => userModel.addSpaceUsed(user.username, sizeInBytes));
    });
}

export function substractUserSpace(element) {
  console.info('Substracting element space to user ' + element.owner_id);
  return calculateElementSpace(element)
    .then(sizeInBytes => {
      console.info(`Substracting ${sizeInBytes} bytes to user ` + element.owner_id);

      return userModel.getById(element.owner_id)
        .then(user => {
          if (!user) {
            console.info('User ' + element.owner_id + ' not exists');
            return ERR_USERS.INVALID_USER;
          }

          return userModel.addSpaceUsed(user.username, sizeInBytes * -1);
        });
    });
}

export function updateUserSpace(newElement, oldElement) {
  console.info('Updating element space to user ' + newElement.owner_id);

  // Checking differences in audio array
  let audiosDiff = (newElement.audios || []).length !== (oldElement.audios || []).length;
  if (!audiosDiff) {
    return Promise.resolve('NoAction');
  }

  let tasks = [
    calculateElementSpace(newElement),
    calculateElementSpace(oldElement)
  ];

  return Promise.all(tasks)
    .then(results => {
      let diff = results[0] - results[1];
      if (diff === 0) {
        return Promise.resolve('NoAction');
      }

      console.info(`${diff > 0 ? 'Adding' : 'Substracting'} ${Math.abs(diff)} bytes`);

      return userModel.getById(newElement.owner_id)
        .then(user => userModel.addSpaceUsed(user.username, diff));
    });
}


function calculateElementSpace(element) {
  // get uris
  let uris = [];
  uris.push(element.source_url);
  uris.push(element.thumbnail_url);

  for (let audio of element.audios || []) {
    uris.push(audio.source_url);
  }

  // calculating element files size
  let filesSizePromise = uris.map(uri => {
    if (!uri) {
      return Promise.resolve(0);
    }

    let args = extractArgsFromUrl(uri);
    return Storage.fileInfo(args.bucket, args.key)
      .then(info => parseInt(info.ContentLength))
      .catch(err => {
        if (err.code === 'NotFound') {
          console.info('File not found with uri: ', uri);
          return Promise.resolve(0);
        }

        throw err;
      });
  });

  return Promise.all(filesSizePromise)
    .then(sizes => sizes.reduce((a, b) => a + b));
}
