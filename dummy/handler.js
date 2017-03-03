import UserModel from '../services/commons/resources/user-model';
import ReferenceModel from '../services/commons/resources/element-user-model';
import ElementModel from '../services/commons/resources/element-model';
import FriendsModel from '../services/commons/resources/friends-model';

const userModel = new UserModel(process.env.USERS_URI);
const elementModel = new ElementModel(process.env.ELEMENTS_URI);
const referenceModel = new ReferenceModel(process.env.REFERENCES_URI);
const friendModel = new FriendsModel(process.env.FRIENDS_URI);

const userId = '33fae558-60b2-46ef-96d9-067522670ef1';
export default (event) => {
  let tasks = [
    logicalDelete(userId),
    removeElementsFor(userId),
    removeFriendsDeps(userId)
  ];

  return Promise.all(tasks);
};

function logicalDelete(userId) {
  return userModel.getById(userId)
    .then(user => {
      if (!user) {
        throw new Error('InvalidId');
      }

      return userModel.update(user.username, { user_status: 'deleted' });
    });
}

function removeElementsFor(userId) {
  console.info('Deleting elements for user ', userId);

  return referenceModel.list(userId)
    .then(references => {
      // filter owned elements
      let owned = [];
      let asVisitor = [];
      for (let ref of references) {
        if (ref.created_at.includes('owner')) {
          owned.push(ref);
        } else {
          asVisitor.push(ref);
        }
      }

      return elementModel.batchRemove(owned.map(r => r.id))
        .then(() => {
          let keys = asVisitor.map(r => ({ user_id: r.user_id, created_at: r.created_at }));
          return referenceModel.batchRemove(keys);
        });
    });
}

function removeFriendsDeps(userId) {
  let tasks = [
    friendModel.whoKnows(userId),
    friendModel.getByUserId(userId)
  ];

  return Promise.all(tasks)
    .then(results => {
      let friendKeys = [...results[0], ...results[1]]
        .map(f => ({ user_id: f.user_id, friend_id: f.friend_id }));

      return friendModel.batchRemove(friendKeys);
    });
}
