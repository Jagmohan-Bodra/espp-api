/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';
import { fakeUsers } from './data';
import * as config from '~/config';
import Cache from '~/clients/cache';

const cache = new Cache({ config });
const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test DELETE //v1/users/:id', () => {
  let validId;
  let token;
  let validTokens;
  const validUser = fakeUsers[0];

  beforeAll(async () => {
    await db.collection('users').deleteMany();
    token = await getToken(request(server), db);
    await db.collection('users').insertOne(validUser);

    const currentUser = await db
      .collection('users')
      .findOne({ email: validUser.email });
    validId = currentUser._id.toHexString();
    validTokens = currentUser.validTokens;
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Authentication Handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server).delete(`/v1/users/${validId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test Validation Handler (400)', () => {
    const testSuites = [
      {
        message: 'Should response BadRequest when when "id" is invalid',
        data: [{ ...validUser, id: 'wrong-object-id-format' }],
      },
    ];

    for (let i = 0; i < testSuites.length; i++) {
      test.each(testSuites[i].data)(testSuites[i].message, async (testCase) => {
        const res = await request(server)
          .delete(`/v1/users/${testCase.id}`)
          .set('Authorization', 'Bearer ' + token)
          .send(testCase);

        expect(res.status).toBe(400);
      });
    }
  });

  describe('Test Resource Not found handler (404)', () => {
    it('Should response BadRequest when "id" is not exist', async () => {
      const invalidId = mongoose.Types.ObjectId();
      const res = await request(server)
        .delete(`/v1/users/${invalidId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });

  describe('Test Happy case Handler 200', () => {
    it('Should deleted successful when input is valid', async () => {
      const res = await request(server)
        .delete(`/v1/users/${validId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(validUser, ['_id']));

      const deletedUser = await db
        .collection('users')
        .findOne({ _id: mongoose.Types.ObjectId(validId) });

      expect(deletedUser).toBeNull();
      await Promise.all(
        validTokens.map(async (token) => {
          const existToken = await cache.getCache({ key: token });
          expect(existToken).toBeNull();
        }),
      );
    });
  });
});
