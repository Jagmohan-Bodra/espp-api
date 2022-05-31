/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';
import dataTest from './data-test';

const request = require('supertest');
const db = global.db;
const server = global.server;

describe('Test GET://v1/customers', () => {
  let token;

  beforeAll(async () => {
    token = await getToken(request(server), db);

    await db.collection('customers').insertMany(dataTest);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server)
        .get(`/v1/customers`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(10);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [], total: '12' },
      });
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(`/v1/customers?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(10);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [], total: '12' },
      });
    });

    it('Should success when filter with name', async () => {
      const res = await request(server)
        .get(`/v1/customers?status[regex]=ACTIVE`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);

      res.body.data.map((item) => expect(item.status).toContain('ACTIVE'));
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(`/v1/customers?meta[pageSize]=3&meta[page]=2`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(`/v1/customers?meta[pageSize]=4&meta[page]=2&meta[sort][]=-status`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(4);
    });
  });

  describe('Should return 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/customers`);

      expect(res.status).toBe(401);
    });
  });
});
