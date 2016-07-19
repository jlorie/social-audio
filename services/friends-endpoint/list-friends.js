import _ from 'lodash';
import FriendsModel from '../commons/resources/friends-model';
import ElementUserModel from '../commons/resources/element-user-model';
import { REF_STATUS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const URI_FRIENDS = process.env.URI_FRIENDS;

const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);
const friendsModel = new FriendsModel(URI_FRIENDS);

const OWNER = 'owner';
const VISITOR = 'visitor';

export function listFriends(userId) {
  console.info('Listing friends for user ' + userId);
  let tasks = [
    friendsModel.getByUserId(userId), // get friends
    getFriendsAudioCount(userId) // get audios by friends
  ];

  return Promise.all(tasks).then(results => {
    let friends = results[0];
    let audioMap = results[1];

    // format output
    let output = [];
    for (let friend of friends) {
      let out = {
        id: friend.friend_id,
        pending: friend.pending,
        created_at: friend.created_at,
        audios: {
          own: audioMap[OWNER][friend.friend_id] || 0,
          network: audioMap[VISITOR][friend.friend_id] || 0
        }
      };

      output.push(out);
    }

    return output;
  });
}

function getFriendsAudioCount(userId) {
  console.info('Querying elements for friend with id ' + userId);
  let filters = {
    ref_status: REF_STATUS.RESOLVED
  };

  return elementsByUserModel.get({ userId, filters })
    .then(references => {
      let audios = {
        visitor: {},
        owner: {}
      };
      // count audios by users
      for (let reference of references.items) {
        let audioMap = reference.audios;
        if (!audioMap || _.isNumber(audioMap)) {
          audioMap = {};
        }

        let ownership = reference.created_at.split('|').pop();
        for (let friendId in audioMap) {
          audios[ownership][friendId] = (audios[ownership][friendId] || 0) + 1;
        }
      }

      return audios;
    });
}
