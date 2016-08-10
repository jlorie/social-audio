import _ from 'lodash';
import UserModel from '../commons/resources/user-model';
import FriendsModel from '../commons/resources/friends-model';
import { USER_STATUS } from '../commons/constants';

const URI_FRIENDS = process.env.URI_FRIENDS;
const URI_USERS = process.env.URI_USERS;
const FEW_MAILS = 100;

const friendsModel = new FriendsModel(URI_FRIENDS);
const userModel = new UserModel(URI_USERS);

let usersMap = new Map();

export function checkEmails(emails, requesterId) {
  console.info(`Discovering friends from ${emails.length} emails`);

  return findUsers(_.uniq(emails)).then(users => {
    // checking friends
    let userIds = users.map(u => u.id);
    return checkFriends(userIds, requesterId)
      .then(friends => users.map(user => {
        let isFriend = friends.find(f => f.friend_id === user.id) !== undefined;
        // ignoring pending not friend users
        if (!isFriend && user.user_status === USER_STATUS.PENDING) {
          return null;
        }

        let output = {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          photo_url: user.photo_url,
          friend: isFriend,
          pending: user.user_status === USER_STATUS.PENDING
        };

        return output;
      }))
      // cleaning null values
      .then(results => results.filter(r => r !== null));
  });
}

function checkFriends(userIds, requesterId) {
  console.info(`Discovering friends from ${userIds.length} for user ${requesterId}`);

  let keys = userIds.map(id => ({ user_id: requesterId, friend_id: id }));
  return friendsModel.batchGet(keys);
}


function findUsers(emails) {
  let isFewEmails = emails.length <= FEW_MAILS;
  if (isFewEmails) {
    return userModel.batchGet(emails);
  }

  // download all emails in db
  return userModel.get().then(users => {
    // save in a map
    for (let user of users) {
      usersMap.set(user.username, user.id);
    }

    let results = [];
    // check db emails against input emails
    for (let email of emails) {
      let userId = usersMap.get(email);
      if (userId) {
        results.push({
          username: email,
          id: userId
        });
      }
    }

    return results;
  });
}
