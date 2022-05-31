/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';

const request = require('supertest');

const db = global.db;
const server = global.server;

let validUser;

describe('Test POST://v1/auth/sign-out', () => {
  validUser = {
    name: 'Mr. Admin',
    phone: '0923456789',
    email: 'admin@email.com',
    password: 'md5-hash-pass',
  };

  const userGroupMock = {
    name: 'admin',
    roles: ['/cms/pages/list', '/cms/pages/create'],
  };

  beforeEach(async () => {
    const userGroup = await db
      .collection('user_groups')
      .insertOne(userGroupMock);

    validUser.userGroup = userGroup.insertedId;
    await db.collection('users').insertOne(validUser);
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should logout success', async () => {
      const resData = await request(server)
        .post('/v1/auth/sign-in')
        .send(_.pick(validUser, ['email', 'password']));
      const { token } = resData.body.data;

      const res = await request(server)
        .post('/v1/auth/sign-out')
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(200);
    });
  });

  describe('Return status 401', () => {
    it('Should return status 401 when token Wrong', async () => {
      const res = await request(server)
        .post('/v1/auth/sign-out')
        .set('Authorization', 'Bearer wrong_token');
      expect(res.status).toBe(401);
    });

    it('Should return status 401 when token deleted', async () => {
      const resData = await request(server)
        .post('/v1/auth/sign-in')
        .send(_.pick(validUser, ['email', 'password']));
      const { token } = resData.body.data;

      await request(server)
        .post('/v1/auth/sign-out')
        .set('Authorization', 'Bearer ' + token);

      const res = await request(server)
        .post('/v1/auth/sign-out')
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(401);
    });
  });
});
