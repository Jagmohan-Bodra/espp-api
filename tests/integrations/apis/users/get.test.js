/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';
import { fakeUserGroup, fakeUsers } from './data';

const request = require('supertest');

const db = global.db;
const server = global.server;
let token;

describe('Test GET //v1/users/:id', () => {
  let validData;
  let validId;

  beforeAll(async () => {
    await db.collection('user_groups').deleteMany();
    await db.collection('users').deleteMany();
    await db.collection('user_groups').insertMany([fakeUserGroup]);
    await db.collection('users').insertMany(fakeUsers);

    validData = await db.collection('users').findOne({});
    validId = validData._id.toHexString();

    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful when "id" is exist', async () => {
      const res = await request(server)
        .get(`/v1/users/${validId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(
        _.omit(validData, ['_id', 'password', 'validTokens']),
      );
    });
  });

  describe('Return status 404', () => {
    it('Should failed when "id" is not exist', async () => {
      const invalidId = mongoose.Types.ObjectId();
      const res = await request(server)
        .get(`/v1/projects/${invalidId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });

  // describe('Return status 400', () => {
  //   it('Should failed when "id" is invalid', async () => {
  //     const invalidId = '121av';
  //     const res = await request(server).get(`/v1/projects/${invalidId}`);

  //     expect(res.status).toBe(400);
  //   });
  // });
});
