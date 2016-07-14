import FriendsModel from '../commons/resources/friends-model';

const URI_FRIENDS = process.env.URI_FRIENDS;
const friendsModel = new FriendsModel(URI_FRIENDS);

export function listFriends(userId) {
  return friendsModel.getByUserId(userId)
    .then(friends => friends.Items);
}
