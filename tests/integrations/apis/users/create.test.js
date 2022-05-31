/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';
import { fakeUsers } from './data';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/users', () => {
  let token;
  let fakeUserGroup;
  const validUser = fakeUsers[0];
  const existUser = fakeUsers[1];
  const uppercaseEmailUser = fakeUsers[3];

  beforeAll(async () => {
    await db.collection('users').deleteMany();
    await db.collection('user_groups').deleteMany();
    await db.collection('users').insertOne(existUser);
    token = await getToken(request(server), db);
    fakeUserGroup = await db.collection('user_groups').findOne();
    validUser.userGroup = fakeUserGroup._id;
  });

  afterAll(async () => {
    await db.collection('users').deleteMany();
  });

  describe('Test Authorization (401)', () => {
    it('Should response 401 when token is not set', async () => {
      const res = await request(server).post(`/v1/users`).send();

      expect(res.status).toBe(401);
    });
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      validUser._id = undefined;
      const res = await request(server)
        .post(`/v1/users`)
        .set('Authorization', 'Bearer ' + token)
        .send(validUser);

      expect(res.status).toBe(200);

      const newUserInDb = await db
        .collection('users')
        .findOne({ email: validUser.email });

      expect(res.body.data).toMatchObject(
        _.omit(newUserInDb, ['_id', 'updatedAt', 'createdAt', 'userGroup']),
      );
    });

    it('Should success with uppercase email', async () => {
      validUser._id = undefined;
      const res = await request(server)
        .post(`/v1/users`)
        .set('Authorization', 'Bearer ' + token)
        .send(uppercaseEmailUser);

      expect(res.status).toBe(200);

      const newUserInDb = await db
        .collection('users')
        .findOne({ email: uppercaseEmailUser.email.toLowerCase() });

      expect(res.body.data).toMatchObject(
        _.omit(newUserInDb, ['_id', 'updatedAt', 'createdAt']),
      );
    });
  });

  describe('Test Validation Handler (400)', () => {
    const testSuites = [
      {
        message: 'Should response BadRequest when "email" is Invalid',
        data: [
          { ...validUser, email: '' },
          { ...validUser, email: 'notEmptyButWrongEmail' },
          existUser,
        ],
      },
      {
        message: 'Should response BadRequest when "phone" is invalid',
        data: [
          { ...validUser, phone: '' },
          { ...validUser, phone: 'notEmptyButWrongPhoneFormat' },
          { ...existUser, email: 'notExistEmail@mail.com' },
        ],
      },
    ];

    for (let i = 0; i < testSuites.length; i++) {
      test.each(testSuites[i].data)(testSuites[i].message, async (testCase) => {
        const res = await request(server)
          .post(`/v1/users`)
          .set('Authorization', 'Bearer ' + token)
          .send(testCase);

        expect(res.status).toBe(400);
      });
    }
  });
});
