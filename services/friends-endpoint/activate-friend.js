import FriendsModel from '../commons/resources/friends-model';
import { SUCCESS } from '../commons/constants';

const URI_FRIENDS = process.env.URI_FRIENDS;
const friendsModel = new FriendsModel(URI_FRIENDS);

export function activateFriend(friendId) {
  console.info('Activating friend ' + friendId);

  return friendsModel.getById(friendId)
    .then(friends => {
      console.log('==> friends: ', JSON.stringify(friends, null, 2));
      return Promise.all(friends.map(friend => {
        let key = {
          user_id: friend.user_id,
          friend_id: friend.friend_id
        };

        return friendsModel.update(key, { pending: false });
      }));
    })
    .then(() => SUCCESS);
}
