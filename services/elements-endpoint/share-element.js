import ElementModel from '../commons/resources/element-model';
import ElementUserModel from '../commons/resources/element-user-model';
import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const URI_ELEMENTS = process.env.URI_ELEMENTS;
const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;

const userModel = new UserModel(URI_USERS);
const elementModel = new ElementModel(URI_ELEMENTS);
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function shareElement(elementId, userId, recipients) {
  console.info('Sharing element ' + elementId + ' with users ' + recipients.join(', '));

  // get element
  return elementModel.getById(elementId)
    .then(element => {
      if (!element) {
        throw new Error('InvalidElement');
      }

      // check permissions
      if (element.owner_id !== userId) {
        throw new Error('InvalidElementToShare');
      }

      // get recipients ids
      return userModel.getByUsernames(recipients)
        .then(users => {
          // bind users with elements
          element.audios = element.audios || [];
          let items = [];
          for (let recipient of users) {
            let binding = {
              id: element.id,
              user_id: recipient.id,
              created_at: element.created_at + '|visitor',
              thumbnail_url: element.thumbnail_url,
              audios: element.audios.filter(a => a.public).length,
              favorite: false
            };

            items.push(binding);
          }

          // check users no registered
          let usersToInvite = getNoRegisteredUsers(recipients, users);
          console.info('Users to invite: ', usersToInvite);

          // TODO notify

          return elementsByUserModel.create(items);
        });
    });
}

function getNoRegisteredUsers(recipients, users) {
  let results = [];

  for (let username of recipients) {
    if (!users.find(user => user.username === username)) {
      results.push(username);
    }
  }

  return results;
}
