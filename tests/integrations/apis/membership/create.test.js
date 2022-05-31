/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST: //v1/memberships', () => {
  let token;
  const validData = {
    name: 'name',
    description: 'description',
    discountPercent: 5,
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should success', async () => {
      const res = await request(server)
        .post(`/v1/memberships`)
        .set('Authorization', 'Bearer ' + token)
        .send(validData);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(validData);
    });
  });

  describe('Return status 400:', () => {
    const testSuites = [
      {
        message: 'Should response BadRequest when type of "name" is wrong',
        data: [{ ...validData, name: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when type of "description" is wrong',
        data: [{ ...validData, description: [1, 2] }],
      },
    ];

    for (let i = 0; i < testSuites.length; i++) {
      test.each(testSuites[i].data)(testSuites[i].message, async (testCase) => {
        const res = await request(server)
          .post(`/v1/memberships`)
          .set('Authorization', 'Bearer ' + token)
          .send(testCase);

        expect(res.status).toBe(400);
      });
    }
  });

  describe('Return status 401:', () => {
    it('Should failed when token is not set', async () => {
      const res = await request(server)
        .post(`/v1/memberships`)
        .send({ ...validData });
      expect(res.status).toBe(401);
    });
  });
});
