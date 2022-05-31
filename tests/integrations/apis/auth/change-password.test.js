/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';

const request = require('supertest');

const db = global.db;
const server = global.server;
let validUser;

describe('Test POST://v1/change-password', () => {
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

  let existToken;

  beforeEach(async () => {
    const userGroup = await db
      .collection('user_groups')
      .insertOne(userGroupMock);

    validUser.userGroup = userGroup.insertedId;
    await db.collection('users').insertOne(validUser);

    const resData = await request(server)
      .post('/v1/auth/sign-in')
      .send(_.pick(validUser, ['email', 'password']));
    existToken = resData.body.data.token;
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should get me success', async () => {
      const res = await request(server)
        .post('/v1/change-password')
        .set('Authorization', 'Bearer ' + existToken)
        .send({ oldPassword: validUser.password, newPassword: 'newpassword' });

      expect(res.status).toBe(200);
    });
  });

  describe('Return status 401', () => {
    it('Should return status 401 when token Wrong', async () => {
      const res = await request(server)
        .post('/v1/change-password')
        .set('Authorization', 'Bearer wrong_token');
      expect(res.status).toBe(401);
    });
  });

  describe('Return status 400', () => {
    it('Should return status 400 when empty oldPassword', async () => {
      const res = await request(server)
        .post('/v1/change-password')
        .set('Authorization', 'Bearer ' + existToken)
        .send({ newPassword: 'newPassword' });
      expect(res.status).toBe(400);
    });

    it('Should return status 400 when empty newPassword', async () => {
      const res = await request(server)
        .post('/v1/change-password')
        .set('Authorization', 'Bearer ' + existToken)
        .send({ oldPassword: 'oldPassword' });
      expect(res.status).toBe(400);
    });
  });

  describe('Return status 400', () => {
    it('Should return status 422 when oldPassword incorrect', async () => {
      const res = await request(server)
        .post('/v1/change-password')
        .set('Authorization', 'Bearer ' + existToken)
        .send({
          oldPassword: 'password_incorrect',
          newPassword: 'newpassword',
        });

      expect(res.status).toBe(422);
    });
  });
});
