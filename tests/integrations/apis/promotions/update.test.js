/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getObjectId } from '~/routes/utils';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('PUT: //v1/promotion/:promotionId', () => {
  let token;
  let promotionId;

  const promotionData = {
    type: 'CASH_REBATE',
    cashRebateValue: 10,
    name: 'name',
    status: 'ENABLED',
    applyFor: 'ALL_PRODUCTS',
    capacity: 200,
  };

  const validData = {
    type: 'PERCENTAGE',
    percentageValue: 3,
    name: 'name update',
    status: 'ENABLED',
    applyFor: 'SPECIAL_PRODUCTS',
    capacity: 2000,
  };

  beforeAll(async () => {
    await db.collection('users').deleteMany();
    token = await getToken(request(server), db);
    const promotion = await db.collection('promotions').insertOne(validData);
    promotionId = promotion.insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Happy case (200)', () => {
    it('Should Update success when input is valid', async () => {
      const res = await request(server)
        .put(`/v1/promotions/${promotionId}`)
        .set('Authorization', 'Bearer ' + token)
        .send(validData);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(validData, ['_id']));
    });
  });

  describe('Test Authentication handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server).put(`/v1/promotions/${promotionId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test Validation Handler (400)', () => {
    it('Should response BadRequest when promotionId is Invalid', async () => {
      const res = await request(server)
        .put(`/v1/promotions/invalid-promotionId`)
        .set('Authorization', 'Bearer ' + token)
        .send(validData);
      expect(res.status).toBe(400);
    });
  });

  describe('Test Resource Not found handler (404)', () => {
    it('Should response BadRequest when "promotionId" is not exist', async () => {
      const res = await request(server)
        .put(`/v1/promotions/123456789012`)
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(404);
    });
  });
});
