/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';

const request = require('supertest');

const db = global.db;
const server = global.server;
let validUser;

describe('Test GET://v1/me', () => {
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
        .get('/v1/me')
        .set('Authorization', 'Bearer ' + existToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(
        _.pick(validUser, ['name', 'email', 'phone']),
      );
    });
  });

  describe('Return status 401', () => {
    it('Should return status 401 when token Wrong', async () => {
      const res = await request(server)
        .get('/v1/me')
        .set('Authorization', 'Bearer wrong_token');
      expect(res.status).toBe(401);
    });
  });
});
