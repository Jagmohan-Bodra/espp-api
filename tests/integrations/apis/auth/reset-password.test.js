/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';

const request = require('supertest');

const db = global.db;
const server = global.server;

let validUser;

describe('/v1/reset-password', () => {
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
    it('Should login success', async () => {
      const res = await request(server)
        .post('/v1/reset-password')
        .send(_.pick(validUser, ['email']));

      expect(res.status).toBe(200);
    });
  });

  describe('Return status 400', () => {
    it('Should return status 400 when empty body', async () => {
      const res = await request(server).post('/v1/reset-password').send({});
      expect(res.status).toBe(400);
    });

    it('Should return status 400 when Email Wrong format', async () => {
      const res = await request(server).post('/v1/reset-password').send({
        email: 'invalidEmail',
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        message: 'Bad Request',
        data: [
          {
            arg: 'email',
            reason: 'Invalid email address',
          },
        ],
      });
    });
  });
});
