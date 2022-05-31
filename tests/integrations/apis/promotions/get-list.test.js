/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');
const db = global.db;
const server = global.server;

describe('Test GET://v1/promotions', () => {
  let token;
  let promotionIds;

  const validData = [
    { type: 'PERCENTAGE', name: 'name1' },
    { type: 'PERCENTAGE', name: 'name2' },
    { type: 'PERCENTAGE', name: 'name3' },
    { type: 'CASH_REBATE', name: 'name4' },
    { type: 'CASH_REBATE', name: 'name5' },
    { type: 'CASH_REBATE', name: 'name6' },
    { type: 'FREE_SHIPPING', name: 'name7' },
    { type: 'FREE_SHIPPING', name: 'name8' },
    { type: 'FREE_SHIPPING', name: 'name9' },
  ];

  beforeAll(async () => {
    await db.collection('promotions').deleteMany();
    token = await getToken(request(server), db);
    const promotions = await db.collection('promotions').insertMany(validData);
    promotionIds = Object.values(promotions.insertedIds);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server)
        .get(`/v1/promotions`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(9);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [] },
      });
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(`/v1/promotions` + `?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(9);
    });

    it('Should success when filter with name', async () => {
      const res = await request(server)
        .get(`/v1/promotions` + `?name[regex]=name1`)
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.map((item) => expect(item.name).toContain('name1'));
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(`/v1/promotions` + `?meta[pageSize]=2&meta[page]=2`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(
          `/v1/promotions` +
            `?meta[pageSize]=2&meta[page]=3&meta[sort][]=-name`,
        )
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('Should return 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/promotions`);

      expect(res.status).toBe(401);
    });
  });
});
