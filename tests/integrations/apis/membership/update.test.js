/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import { getToken } from '../util';
import dataTest from './data-test';
import errorMessages from '~/routes/constants/error-messages';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test PUT //v1/memberships/:membershipId', () => {
  let token;
  let membershipId;
  const validData = {
    name: 'name',
    description: 'description',
  };

  const getPath = (membershipId) => `/v1/memberships/${membershipId}`;

  beforeAll(async () => {
    token = await getToken(request(server), db);

    const data = await db.collection('memberships').insertMany(dataTest);
    membershipId = data.insertedIds[0].toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful', async () => {
      const res = await request(server)
        .put(getPath(membershipId))
        .set('Authorization', 'Bearer ' + token)
        .send(validData);

      expect(res.status).toBe(200);
    });
  });

  describe('Return status 400', () => {
    it('Should response BadRequest when membershipId is invalid', async () => {
      const res = await request(server)
        .put(getPath('invalid-membershipId'))
        .set('Authorization', 'Bearer ' + token)
        .send(validData);
      expect(res.status).toBe(400);
    });

    const testSuites = [
      {
        message: 'Should response BadRequest when type of "name" is wrong',
        data: [{ name: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when type of "description" is wrong',
        data: [{ description: [1, 2] }],
      },
    ];

    for (let i = 0; i < testSuites.length; i++) {
      test.each(testSuites[i].data)(testSuites[i].message, async (testCase) => {
        const res = await request(server)
          .put(getPath(membershipId))
          .set('Authorization', 'Bearer ' + token)
          .send(testCase);

        expect(res.status).toBe(400);
      });
    }
  });

  describe('Return status 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).put(getPath(membershipId));

      expect(res.status).toBe(401);
    });
  });

  describe('Return status 404', () => {
    it('Should be failed when membership is not found', async () => {
      const res = await request(server)
        .get(getPath('123456789012'))
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(errorMessages.MEMBERSHIP_NOT_FOUND);
    });
  });
});
