/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test GET //v1/promotions/:promotionId', () => {
  let token;
  let promotionId;

  const validData = {
    type: 'CASH_REBATE',
    cashRebateValue: 10,
    name: 'name',
    status: 'status',
    applyFor: 'ALL_PRODUCTS',
    capacity: 200,
  };

  beforeAll(async () => {
    await db.collection('promotions').deleteMany();
    token = await getToken(request(server), db);
    const promotion = await db.collection('promotions').insertOne(validData);
    promotionId = promotion.insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful', async () => {
      const res = await request(server)
        .get(`/v1/promotions/${promotionId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(validData, ['_id']));
    });
  });

  describe('Return status 400', () => {
    it('Should response BadRequest when promotionId is invalid', async () => {
      const res = await request(server)
        .get(`/v1/promotions/invalid-promotionId`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
    });
  });

  describe('Return status 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/promotions//${promotionId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Return status 404', () => {
    it('Should failed when customerId is not found', async () => {
      const res = await request(server)
        .get(`/v1/promotions/012345678912`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });
});
