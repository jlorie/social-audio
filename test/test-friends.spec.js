/* eslint-env mocha */

import { expect } from 'chai';
import sinon from 'sinon';

import endpoint from '../services/friends-endpoint/handler';
import FriendsModel from '../services/commons/resources/friends-model';
import { SUCCESS } from '../services/commons/constants';

const context = {
  succeed(result) {
    return result;
  },
  fail(result) {
    return result;
  }
};

describe('friends-endpoint', () => {
  it('`List friends from contacts pepe@bbluue.com should return 2 results', function() {
    let input = {
      action: 'list',
      identity_id: 'us-east-1:07484310-0a1a-48e0-b9c7-28257150f04a'
    };

    // stubs
    const getFriendsStub = this.sandbox.stub(FriendsModel.prototype, 'getByUserId', getFriends);

    return endpoint(input, context)
      .then(results => {
        console.log('==> results: ', JSON.stringify(results, null, 2));
        const userId = input.identity_id.split(':').pop();

        // spies
        expect(getFriendsStub).to.be.calledWith(userId);

        // asserts
        expect(results).to.have.lengthOf(2);
        let expectedFirstResult = {
          user_id: 'c6db8888-cfc5-4e4a-b130-80409469d21a',
          fullname: 'Alejandro JL',
          email: 'ajimenez@bbluue.com',
          audios: 3,
          pending: false
        };

        let expectedSecondResult = {
          email: 'calvarez@bbluue.com',
          audios: 0,
          pending: true
        };

        expect(results[0]).to.deep.equal(expectedFirstResult);
        expect(results[1]).to.deep.equal(expectedSecondResult);
      });
  });

  it('`Adding a friend should return SUCCESS', function() {
    let input = {
      action: 'add',
      friend_id: 'c6db8888-cfc5-4e4a-b130-80409469d21a',
      identity_id: 'us-east-1:07484310-0a1a-48e0-b9c7-28257150f04a'
    };

    // stubs
    const createFriendStub = this.sandbox.stub(FriendsModel.prototype, 'create', createFriend);

    return endpoint(input, context)
      .then(result => {
        const userId = input.identity_id.split(':').pop();
        const expectedInput = {
          user_id: userId,
          friend_id: input.friend_id,
          pending: false
        };

        // spies
        expect(createFriendStub).to.be.calledWith(sinon.match(expectedInput));

        // asserts
        expect(result).to.deep.equal(SUCCESS);
      });
  });
});

function getFriends() {
  let results = [{
    user_id: 'c6db8888-cfc5-4e4a-b130-80409469d21a',
    fullname: 'Alejandro JL',
    email: 'ajimenez@bbluue.com',
    created_at: '2016-06-23T17:20:01.290Z',
    pending: false
  }, {
    email: 'calvarez@bbluue.com',
    created_at: '2016-06-04T16:33:29.620Z',
    pending: true
  }];

  return Promise.resolve(results);
}

function createFriend() {
  return Promise.resolve(SUCCESS);
}
