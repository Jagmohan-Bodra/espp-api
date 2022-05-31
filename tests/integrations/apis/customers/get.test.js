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

describe('Test GET //v1/customer/:id', () => {
  let token;
  let customerId;
  const getPath = (customerId) => `/v1/customers/${customerId}`;

  beforeAll(async () => {
    token = await getToken(request(server), db);

    const data = await db.collection('customers').insertMany(dataTest);
    customerId = data.insertedIds[0].toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful', async () => {
      const res = await request(server)
        .get(getPath(customerId))
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(
        _.omit(dataTest[0], ['_id', 'membership', 'user', 'orderHistory']),
      );
    });
  });

  describe('Return status 400', () => {
    it('Should be failed when customerId is invalid', async () => {
      const res = await request(server)
        .get(getPath('invalidCustomerId'))
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
      expect(res.body.data[0].reason).toBe(errorMessages.CUSTOMER_ID_INVALID);
    });
  });

  describe('Return status 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(getPath(customerId));

      expect(res.status).toBe(401);
    });
  });

  describe('Return status 404', () => {
    it('Should be failed when customer is not found', async () => {
      const res = await request(server)
        .get(getPath('123456789012'))
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(errorMessages.CUSTOMER_NOT_FOUND);
    });
  });
});
