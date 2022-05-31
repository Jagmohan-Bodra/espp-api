/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import { getToken } from '../util';
import dataTest from './data-test';
import * as config from '~/config';
import Cache from '~/clients/cache';
import errorMessages from '~/routes/constants/error-messages';

const cache = new Cache({ config });
const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST //v1/customers/:customerId/subspend', () => {
  let token;
  let customerId;
  let userId;
  let validTokens;

  const validaData = dataTest[0];
  const getPath = (customerId) => `/v1/customers/${customerId}/subspend`;

  beforeAll(async () => {
    token = await getToken(request(server), db);
    const user = await db.collection('users').findOne({});

    userId = user._id;
    validTokens = user.validTokens;

    validaData.user = userId;
    const data = await db.collection('customers').insertOne(validaData);
    customerId = data.insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).post(getPath(customerId));

      expect(res.status).toBe(401);
    });
  });

  describe('Return status 400', () => {
    it('Should be failed when customerId is invalid', async () => {
      const res = await request(server)
        .post(getPath('invalid-customerId'))
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
      expect(res.body.data[0]).toMatchObject({
        reason: errorMessages.CUSTOMER_ID_INVALID,
      });
    });
  });

  describe('Return status 404', () => {
    it('Should be failed when customerId is not found', async () => {
      const res = await request(server)
        .post(getPath('012345678912'))
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        message: errorMessages.CUSTOMER_NOT_FOUND,
      });
    });
  });

  // describe('Return status 200', () => {
  //   it('Should be successful', async () => {
  //     const res = await request(server)
  //       .post(getPath(customerId))
  //       .set('Authorization', 'Bearer ' + token);

  //     expect(res.status).toBe(200);

  //     const user = await db.collection('users').findOne(userId);
  //     expect(user).toMatchObject({ active: false, validTokens: [] });

  //     await Promise.all(
  //       validTokens.map(async (token) => {
  //         const getToken = await cache.getCache({ key: token });
  //         expect(getToken).toBeNull();
  //       }),
  //     );
  //   });
  // });
});
