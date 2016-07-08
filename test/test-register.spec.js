/* eslint-env mocha */

import { expect } from 'chai';

import { register, registerPending } from '../services/security-register/register';
import { getEncryptedPassword } from '../services/commons/helpers/password-helper';
import { USER_STATUS } from '../services/commons/constants';

import UserModel from '../services/commons/resources/user-model';
import CredentialProvider from '../services/commons/remote/credentials-provider';

describe('security-register', () => {
  const userInfo = {
    username: 'pepe@bbluue.com',
    fullname: 'Javier Lorie Guerra',
    genre: 'M',
    birthdate: '1987-10-19',
    password: 'password'
  };

  const identityId = 'us-east-1:33fae558-60b2-46ef-96d9-067522670ef1';
  const userId = identityId.split(':').pop();

  it('Registering an user pepe@bbluue.com should return new user data object', function() {
    // stubs
    const getUserIdentityStub = this.sandbox.stub(CredentialProvider.prototype, 'getUserIdentity',
      () => Promise.resolve(identityId));

    const getByIdStub = this.sandbox.stub(UserModel.prototype, 'getById',
      () => Promise.resolve(null));

    const getByNameStub = this.sandbox.stub(UserModel.prototype, 'getByUsername',
      () => Promise.resolve(null));

    const createUserStub = this.sandbox.stub(UserModel.prototype, 'create',
      (userData) => Promise.resolve(userData));

    return register(userInfo)
      .then(result => {
        // spies
        expect(getUserIdentityStub).to.be.calledWith();
        expect(getByIdStub).to.be.calledWith(userId);
        expect(getByNameStub).to.be.calledWith(userInfo.username);
        expect(createUserStub).to.be.calledWith();

        // asserts
        expect(result.fullname).to.equal(userInfo.fullname);
        expect(result.genre).to.equal(userInfo.genre);
        expect(result.birthdate).to.equal(new Date(userInfo.birthdate).toISOString());
        expect(result.password).to.equal(getEncryptedPassword(userInfo.password));
        expect(result.email_status).to.equal('suscribed');
        expect(result.user_status).to.equal('disabled');
        expect(result.space_used).to.equal(0);
        expect(result.account_type).to.equal('basic');
        expect(result.notifications_enabled).to.equal(true);
        expect(result.username).to.equal(userInfo.username);
        expect(result).to.have.property('created_at');
        expect(result.id).to.equal(userId);
        expect(result.identity_id).to.equal(identityId);
      });
  });

  it('Registering an user with cognito generating existing identity id should retry', function() {
    // stubs
    this.sandbox.stub(UserModel.prototype, 'getByUsername', () => Promise.resolve(null));
    this.sandbox.stub(UserModel.prototype, 'create', userData => Promise.resolve(userData));
    this.sandbox.stub(CredentialProvider.prototype, 'getUserIdentity',
      () => Promise.resolve(identityId));

    let callCounts = 0;
    const getByIdStub = this.sandbox.stub(UserModel.prototype, 'getById',
      () => {
        callCounts++;
        if (callCounts === 1) {
          // return existing user
          return Promise.resolve({ id: userId });
        }

        return Promise.resolve(null);
      });

    return register(userInfo)
      .then(result => {
        // spies
        expect(getByIdStub).to.have.been.callCount(2);

        // asserts
        expect(result).to.have.property('id');
        expect(result.id).to.be.equal(userId);
      });
  });

  it('Registering an user as pending should return an user with status pending', function() {
    const usernames = ['pepe@bbluue.com'];

    // stubs
    this.sandbox.stub(UserModel.prototype, 'batchGet', () => Promise.resolve([]));
    this.sandbox.stub(UserModel.prototype, 'batchCreate', (users) => Promise.resolve(users));
    this.sandbox.stub(CredentialProvider.prototype, 'getUserIdentity',
      () => Promise.resolve(identityId));


    return registerPending(usernames)
      .then(result => {
        // asserts
        expect(result).to.have.length(1);
        expect(result[0].id).to.equal(userId);
        expect(result[0].user_status).to.equal(USER_STATUS.PENDING);
      });
  });

  it('Registering an existing pending user should update user with status disabled', function() {
    // stubs
    this.sandbox.stub(UserModel.prototype, 'update', (name, userData) => Promise.resolve(userData));
    this.sandbox.stub(UserModel.prototype, 'getByUsername', () => {
      let userResult = {
        id: userId,
        user_status: USER_STATUS.PENDING
      };

      return Promise.resolve(userResult);
    });

    return register(userInfo)
      .then(result => {
        // asserts
        expect(result).to.have.property('fullname');
        expect(result.fullname).to.equal(userInfo.fullname);
        expect(result.user_status).to.equal('disabled');
      });
  });

  it('Registering an existing user should throw an error', function() {
    this.sandbox.stub(UserModel.prototype, 'getByUsername', () => {
      let userResult = {
        id: userId,
        user_status: USER_STATUS.ENABLED
      };

      return Promise.resolve(userResult);
    });

    return register(userInfo)
      .catch(err => {
        expect(err).to.be.an('error');
      });
  });
});
