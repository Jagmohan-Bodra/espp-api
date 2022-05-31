/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';
import { fakeUsers } from './data';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('PUT: //v1/users/:id', () => {
  let validId;
  let token;
  const validUser = fakeUsers[0];

  beforeAll(async () => {
    db.collection('users').deleteMany();
    token = await getToken(request(server), db);
    await db.collection('users').insertOne(fakeUsers[0]);

    const currentUser = await db
      .collection('users')
      .findOne({ email: validUser.email });
    validId = currentUser._id.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Authentication handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server)
        .put(`/v1/users/${validId}`)
        .send(validUser);

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
          .put(`/v1/users/${testCase.id}`)
          .set('Authorization', 'Bearer ' + token)
          .send(testCase);

        expect(res.status).toBe(400);
      });
    }
  });

  describe('Test Resource Notfound handler (404)', () => {
    it('Should response 404 when "id" is not exist', async () => {
      const invalidId = mongoose.Types.ObjectId();
      const res = await request(server)
        .put(`/v1/users/${invalidId}`)
        .set('Authorization', 'Bearer ' + token)
        .send(validUser);

      expect(res.status).toBe(404);
    });
  });

  describe('Test Happy case (200)', () => {
    it('Should Update success when input is valid', async () => {
      const newStageOfUser = {
        ...validUser,
        name: 'Update to new name',
        email: 'random@mail.com',
        phone: '01231243333',
      };

      const res = await request(server)
        .put(`/v1/users/${validId}`)
        .set('Authorization', 'Bearer ' + token)
        .send(newStageOfUser);

      expect(res.status).toBe(200);
      expect(res.body.data.email).not.toBe('random@mail.com');

      const updateUser = await db
        .collection('users')
        .findOne({ _id: mongoose.Types.ObjectId(validId) });

      expect(res.body.data).toMatchObject(_.omit(updateUser, '_id'));
    });
  });
});
