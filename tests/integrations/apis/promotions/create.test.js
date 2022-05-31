/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST: //v1/promotions', () => {
  let token;

  const percentageData = {
    allProduct: {
      type: 'PERCENTAGE',
      percentageValue: 10,
      name: 'name',
      status: 'ENABLED',
      applyFor: 'ALL_PRODUCTS',
      capacity: 200,
    },
    spectialProducts: {
      type: 'PERCENTAGE',
      percentageValue: 10,
      name: 'name',
      status: 'ENABLED',
      applyFor: 'SPECIAL_PRODUCTS',
      capacity: 200,
    },
  };
  const cashRebateData = {
    allProduct: {
      type: 'CASH_REBATE',
      cashRebateValue: 10,
      name: 'name',
      status: 'ENABLED',
      applyFor: 'ALL_PRODUCTS',
      capacity: 200,
    },
    spectialProducts: {
      type: 'CASH_REBATE',
      cashRebateValue: 10,
      name: 'name',
      status: 'ENABLED',
      applyFor: 'SPECIAL_PRODUCTS',
      capacity: 200,
    },
  };

  const freeShippingData = {
    allProduct: {
      type: 'FREE_SHIPPING',
      isFullShippingFee: true,
      name: 'name',
      status: 'ENABLED',
      applyFor: 'ALL_PRODUCTS',
      capacity: 200,
    },
    spectialProducts: {
      type: 'FREE_SHIPPING',
      name: 'name',
      status: 'ENABLED',
      applyFor: 'SPECIAL_PRODUCTS',
      capacity: 200,
      freeShippingMaximum: 10,
    },
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should success when promotion type is PERCENTAGE, applyFor: ALL_PRODUCTS', async () => {
      const data = percentageData.allProduct;
      const res = await request(server)
        .post(`/v1/promotions`)
        .set('Authorization', 'Bearer ' + token)
        .send(data);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(data);
    });

    it('Should success when promotion type is PERCENTAGE, applyFor: SPECTIAL_PRODUCT', async () => {
      const data = percentageData.spectialProducts;
      const res = await request(server)
        .post(`/v1/promotions`)
        .set('Authorization', 'Bearer ' + token)
        .send(data);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(data);
    });

    it('Should success when promotion type is CASH_REBATE, applyFor: ALL_PRODUCT', async () => {
      const data = cashRebateData.allProduct;
      const res = await request(server)
        .post(`/v1/promotions`)
        .set('Authorization', 'Bearer ' + token)
        .send(data);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(data);
    });

    it('Should success when promotion type is CASH_REBATE, applyFor: SPECTIAL_PRODUCT', async () => {
      const data = percentageData.spectialProducts;
      const res = await request(server)
        .post(`/v1/promotions`)
        .set('Authorization', 'Bearer ' + token)
        .send(data);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(data);
    });

    it('Should success when promotion type is FREE_SHIPPING, applyFor: ALL_PRODUCT', async () => {
      const data = freeShippingData.allProduct;
      const res = await request(server)
        .post(`/v1/promotions`)
        .set('Authorization', 'Bearer ' + token)
        .send(data);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(data);
    });

    it('Should success when promotion type is FREE_SHIPPING, applyFor: SPECTIAL_PRODUCT', async () => {
      const data = freeShippingData.spectialProducts;
      const res = await request(server)
        .post(`/v1/promotions`)
        .set('Authorization', 'Bearer ' + token)
        .send(data);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(data);
    });
  });

  describe('Return status 400:', () => {
    const testSuites = [
      {
        message:
          'Should response BadRequest when type is not in [PERCENTAGE, CASH_REBATE, FREE_SHIPPING]',
        data: [{ type: 'wrong-type' }],
      },
      {
        message:
          'Should response BadRequest when applyFor is not in [ALL_PRODUCTS, SPECIAL_PRODUCTS]',
        data: [{ type: 'PERCENTAGE', applyFor: 'wrong-applyfor' }],
      },
      {
        message:
          'Should response BadRequest when type PERCENTAGE but percentageValue is not exist',
        data: [{ type: 'PERCENTAGE' }],
      },
      {
        message:
          'Should response BadRequest when type CASH_REBATE but cashRebateValue is not exist',
        data: [{ type: 'CASH_REBATE' }],
      },
      {
        message:
          'Should response BadRequest when type FREE_SHIPPING,isFullShippingFee is false, freeShippingMaximum is not exist',
        data: [{ type: 'FREE_SHIPPING' }],
      },
    ];

    for (let i = 0; i < testSuites.length; i++) {
      test.each(testSuites[i].data)(testSuites[i].message, async (testCase) => {
        const res = await request(server)
          .post(`/v1/promotions`)
          .set('Authorization', 'Bearer ' + token)
          .send(testCase);

        expect(res.status).toBe(400);
      });
    }
  });

  describe('Return status 401:', () => {
    it('Should failed when token is not set', async () => {
      const res = await request(server)
        .post(`/v1/promotions`)
        .send(percentageData.allProduct);
      expect(res.status).toBe(401);
    });
  });
});
