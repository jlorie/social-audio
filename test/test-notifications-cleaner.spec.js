/* eslint-env mocha */

import { expect } from 'chai';
import sinon from 'sinon';

import NotificationModel from '../services/commons/resources/notification-model';
import notificationsCleaner from '../services/notifications-cleaner/handler';
import { SUCCESS } from '../services/commons/constants';

const context = {
  succeed(result) {
    return result;
  },
  fail(result) {
    return result;
  }
};

describe('notifications-cleaner', () => {
  it('Cleaning notifications for an element should remove every notification related ' +
    'with the element',
    function() {
      // input
      const input = {
        element_id: 'd5d3ea1899a313e9a430bc4359871c64',
        user_id: '07484310-0a1a-48e0-b9c7-28257150f04a',
        owner: true
      };

      // stubs
      const getNotificationsStub = this.sandbox.stub(NotificationModel.prototype,
        'getNotificationsForElement', getNotifications);
      const batchRemoveStub = this.sandbox.stub(NotificationModel.prototype,
        'batchRemove', batchRemove);

      return notificationsCleaner(input, context)
        .then(result => {
          const expectedParams = [{
            created_at: '2016-07-08T22:05:54.570Z',
            user_id: '07484310-0a1a-48e0-b9c7-28257150f04a'
          }, {
            created_at: '2016-07-10T15:48:09.250Z',
            user_id: 'f186e582-9362-4d20-8618-4ab24f753c9d'
          }];

          // spies
          expect(getNotificationsStub).to.be.calledWith(input.element_id, null);
          expect(batchRemoveStub).to.be.calledWith(sinon.match(expectedParams));

          // asserts
          expect(result).to.deep.equal(SUCCESS);
        });
    });

  it('Cleaning notifications for an element when user is not owner should ' +
    ' remove only his references',
    function() {
      // input
      const input = {
        element_id: 'd5d3ea1899a313e9a430bc4359871c64',
        user_id: 'f186e582-9362-4d20-8618-4ab24f753c9d',
        owner: false
      };

      // stubs
      const getNotificationsStub = this.sandbox.stub(NotificationModel.prototype,
        'getNotificationsForElement', getNotifications);
      const batchRemoveStub = this.sandbox.stub(NotificationModel.prototype,
        'batchRemove', batchRemove);

      return notificationsCleaner(input, context)
        .then(result => {
          const expectedParams = [{
            created_at: '2016-07-10T15:48:09.250Z',
            user_id: 'f186e582-9362-4d20-8618-4ab24f753c9d'
          }];

          // spies
          expect(getNotificationsStub).to.be.calledWith(input.element_id, input.user_id);
          expect(batchRemoveStub).to.be.calledWith(sinon.match(expectedParams));

          // asserts
          expect(result).to.deep.equal(SUCCESS);
        });
    });

  // TODO
  it('Cleaning notification for an audio should remove notifications related with this audio',
    function() {
      // input
      const input = {
        element_id: 'd5d3ea1899a313e9a430bc4359871c64',
        audio_id: '8eb8a8bcdf43ff9598b24a2f637bc3a6'
      };

      // stubs
      const getNotificationsStub = this.sandbox.stub(NotificationModel.prototype,
        'getNotificationsForElement', getNotifications);
      const batchRemoveStub = this.sandbox.stub(NotificationModel.prototype,
        'batchRemove', batchRemove);

      return notificationsCleaner(input, context)
        .then(result => {
          const expectedParams = [{
            created_at: '2016-07-10T15:48:09.250Z',
            user_id: 'f186e582-9362-4d20-8618-4ab24f753c9d'
          }];

          // spies
          expect(getNotificationsStub).to.be.calledWith(input.element_id, null);
          expect(batchRemoveStub).to.be.calledWith(sinon.match(expectedParams));

          // asserts
          expect(result).to.deep.equal(SUCCESS);
        });
    });
});

function getNotifications(elementId, userId) {
  let results = [{
    created_at: '2016-07-08T22:05:54.570Z',
    details: {
      emitter_name: 'Pedro Villamar',
      pending: false,
      thumbnail_url: 'https://s3.amazonaws.com/dev-bbluue-files/images/480p-f4d1ec5f603f56c4a606eb4449b370a9.jpg'
    },
    element_id: 'd5d3ea1899a313e9a430bc4359871c64',
    emitter_id: '7879fd52-3956-422f-b356-71c4264e80a4',
    id: '240d9f90-4558-11e6-b406-69d84dc79719',
    type: 'audio_request',
    user_id: '07484310-0a1a-48e0-b9c7-28257150f04a',
    viewed: true
  }, {
    created_at: '2016-07-10T15:48:09.250Z',
    details: {
      audio_id: '8eb8a8bcdf43ff9598b24a2f637bc3a6',
      emitter_name: 'Maria Alejandra Villamar',
      thumbnail_url: 'https://s3.amazonaws.com/dev-bbluue-files/images/480p-f4d1ec5f603f56c4a606eb4449b370a9.jpg'
    },
    element_id: 'd5d3ea1899a313e9a430bc4359871c64',
    emitter_id: '33fae558-60b2-46ef-96d9-067522670ef1',
    id: 'b34be821-46b5-11e6-aa37-8dd6f60788ad',
    type: 'new_audio',
    user_id: 'f186e582-9362-4d20-8618-4ab24f753c9d',
    viewed: false
  }];

  results = results.filter(r => r.element_id === elementId && (userId ? r.user_id === userId : true));
  return Promise.resolve(results);
}

function batchRemove() {
  return Promise.resolve('OK');
}
