/* eslint-env mocha */

import { expect } from 'chai';
import sinon from 'sinon';

import endpoint from '../services/friends-endpoint/handler';
import FriendsModel from '../services/commons/resources/friends-model';

const context = {
  succeed(message) {
    console.info('==> success: ' + message);
  },

  fail(message) {
    console.info('==> fail: ' + message);
  }
};

describe('friends-endpoint', () => {
  it('`List friends from contacts pepe@bbluue.com', function() {
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
          fullname: 'One',
          email: 'one@bbluue.com',
          audios: 3,
          pending: false
        };

        let expectedSecondResult = {
          fullname: 'Two',
          email: 'two@bbluue.com',
          audios: 0,
          pending: true
        };

        expect(results[0]).to.deep.equal(expectedFirstResult);
        expect(results[1]).to.deep.equal(expectedSecondResult);
      });
  });
});

function getFriends() {
  let results = {
    Items: [{
      fullname: 'One',
      email: 'one@bbluue.com',
      created_at: '2016-07-08T22:06:31.298Z'
    }, {
      fullname: 'Two',
      email: 'two@bbluue.com',
      created_at: '2016-07-08T22:06:31.298Z'
    }]
  };

  return Promise.resolve(results);
}
