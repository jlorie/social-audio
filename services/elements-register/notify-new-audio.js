import ElementUserModel from '../commons/resources/element-user-model';
import DeviceUserModel from '../commons/resources/device-user-model';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const URI_DEVICES_BY_USERS = process.env.URI_DEVICES_BY_USERS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);
const devicesByUserModel = new DeviceUserModel(URI_DEVICES_BY_USERS);

export function notifyNewAudio(ownerId, elementId, attachment) {
  console.info('Notifying new audio uploaded for users related to element ' + elementId);
  // get users related to the element
  return elementsByUserModel.getById(elementId)
    .then(users => {
      // get tokens for devices related to users
      let userIds = users.filter(u => u.id !== ownerId).map(u => u.id);
      return Promise.all(userIds.map(devicesByUserModel.getByUserId));
    })
    .then(deviceTokens => {

    });
  // notify every user
}
