import _ from 'lodash';
import UserModel from '../commons/resources/user-model';
import FriendsModel from '../commons/resources/friends-model';
import { USER_STATUS } from '../commons/constants';

const URI_FRIENDS = process.env.URI_FRIENDS;
const URI_USERS = process.env.URI_USERS;

const friendsModel = new FriendsModel(URI_FRIENDS);
const userModel = new UserModel(URI_USERS);

export function checkEmails(emails, requesterId) {
  console.info(`Discovering friends from ${emails.length} emails`);

  let unique = _.uniq(emails);
  return userModel.batchGet(unique).then(users => {
    // checking friends
    let userIds = users.map(u => u.id);
    return checkFriends(userIds, requesterId)
      .then(friends => users.map(user => {
        let isFriend = friends.find(f => f.friend_id === user.id) !== undefined;
        let output = {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          photo_url: user.photo_url,
          friend: isFriend,
          pending: user.user_status === USER_STATUS.PENDING && isFriend
        };

        return output;
      }));
  });
}

function checkFriends(userIds, requesterId) {
  console.info(`Discovering friends from ${userIds.length} for user ${requesterId}`);

  let keys = userIds.map(id => ({ user_id: requesterId, friend_id: id }));
  return friendsModel.batchGet(keys);
}
