import FriendsModel from '../commons/resources/friends-model';
import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const URI_FRIENDS = process.env.URI_FRIENDS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);
const friendsModel = new FriendsModel(URI_FRIENDS);

export function listFriends(userId) {
  console.info('Listing friends for user ' + userId);
  return friendsModel.getByUserId(userId)
    .then(friends => friends);
}

function getFriendsAudioCount(userId) {
  console.info('Querying elements for user with id ' + userId);
  let filters = {
    ref_status: REF_STATUS.RESOLVED
  };

  // TODO count audios by friends
}
