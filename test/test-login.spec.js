/* eslint-env mocha */

import { expect } from 'chai';
import sinon from 'sinon';

import { authenticate } from '../services/security-login/authenticate';
import { getEncryptedPassword } from '../services/commons/helpers/password-helper';
import { USER_STATUS } from '../services/commons/constants';

import UserModel from '../services/commons/resources/user-model';
import CredentialProvider from '../services/commons/remote/credentials-provider';

const identityId = 'us-east-1:33fae558-60b2-46ef-96d9-067522670ef1';
const userId = identityId.split(':').pop();
const username = 'pepe@bbluue.com';
const password = 'password';
const invalidPass = 'invalid';

describe('security-login', () => {
  it('Login user pepe@bbluue.com should return proper credentials', function() {
    // stubs
    const getByNameStub = this.sandbox.stub(UserModel.prototype, 'getByUsername', getByUsername);
    const getCredentialsStub = this.sandbox.stub(CredentialProvider.prototype, 'getUserCredentials',
      getCredentials);

    return authenticate(username, password)
      .then(result => {
        // spies
        expect(getByNameStub).to.be.calledWith(username);
        expect(getCredentialsStub).to.be.calledWith(sinon.match({ identityId, username }));

        // asserts
        expect(result).to.have.property('accessKey');
        expect(result).to.have.property('secretKey');
        expect(result).to.have.property('sessionToken');
        expect(result).to.have.property('userId');
      });
  });

  it('Login an user with invalid password should throw an error', function() {
    // stubs
    const getByNameStub = this.sandbox.stub(UserModel.prototype, 'getByUsername', getByUsername);

    return authenticate(username, invalidPass)
      .catch(err => {
        // spies
        expect(getByNameStub).to.be.calledWith(username);

        // asserts
        expect(err).to.be.an('error');
      });
  });

  it('Login an user with invalid status should throw an error', function() {
    // stubs
    const getByNameStub = this.sandbox.stub(UserModel.prototype, 'getByUsername', getByUsername);

    return authenticate(username, invalidPass)
      .catch(err => {
        // spies
        expect(getByNameStub).to.be.calledWith(username);

        // asserts
        expect(err).to.be.an('error');
      });
  });
});


function getCredentials() {
  let credentials = {
    accessKey: 'ASIAJNDX5UBN54CG46XA',
    secretKey: 'Ehhk72in9de/nMwnmYLRj/fAYlB+JQuBQbsyaNzf',
    sessionToken: 'FQoDYXdzEMH//////////wEaDCFT+vPxVCBQNeM0+SLYAwZcfBX04FL5fVxdK...',
    expiration: '2016-07-07T17:01:49.000Z',
    region: 'us-east-1',
    userId: 'f186e582-9362-4d20-8618-4ab24f753c9d'
  };

  return Promise.resolve(credentials);
}

function getByUsername() {
  let userResult = {
    id: userId,
    identity_id: identityId,
    username,
    password: getEncryptedPassword(password),
    user_status: USER_STATUS.ENABLED
  };

  return Promise.resolve(userResult);
}

function getInvalidStatusUser() {
  let userResult = {
    id: userId,
    identity_id: identityId,
    username,
    password: getEncryptedPassword(password),
    user_status: USER_STATUS.DISABLED
  };

  return Promise.resolve(userResult);
}
