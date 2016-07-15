import FriendsModel from '../commons/resources/friends-model';
import { SUCCESS } from '../commons/constants';

const URI_FRIENDS = process.env.URI_FRIENDS;
const friendsModel = new FriendsModel(URI_FRIENDS);

export function addFriend(userId, friendId) {
  console.info(`Adding new friend ${friendId} for user ${userId}`);
  let newFriend = {
    user_id: userId,
    friend_id: friendId,
    created_at: new Date().toISOString(),
    pending: false
  };

  return friendsModel.create(newFriend).then(() => SUCCESS);
}
