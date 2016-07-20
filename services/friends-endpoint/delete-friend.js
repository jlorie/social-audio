import FriendsModel from '../commons/resources/friends-model';
import { SUCCESS } from '../commons/constants';

const URI_FRIENDS = process.env.URI_FRIENDS;
const friendsModel = new FriendsModel(URI_FRIENDS);

export function deleteFriend(userId, friendId) {
  console.info(`Deleting friend ${friendId} for user ${userId}`);
  let key = {
    user_id: userId,
    friend_id: friendId
  };

  return friendsModel.remove(key).then(() => SUCCESS);
}
