/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';
import dataTest from './data-test';

const request = require('supertest');
const db = global.db;
const server = global.server;

describe('Test GET://v1/memberships', () => {
  let token;
  const getPath = () => `/v1/memberships`;
  beforeAll(async () => {
    token = await getToken(request(server), db);

    await db.collection('memberships').insertMany(dataTest);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server)
        .get(getPath())
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0]).toMatchObject(_.omit(dataTest[0], ['_id']));
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [], total: '3' },
      });
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(getPath() + `?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0]).toMatchObject(_.omit(dataTest[0], ['_id']));
    });

    it('Should success when filter with name', async () => {
      const res = await request(server)
        .get(getPath() + `?name[regex]=name1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);

      res.body.data.map((item) => expect(item.name).toContain('name1'));
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(getPath() + `?meta[pageSize]=1&meta[page]=2`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data).toMatchObject([_.omit(dataTest[1], ['_id'])]);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(getPath() + `?meta[pageSize]=2&meta[page]=1&meta[sort][]=-name`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0]).toMatchObject(_.omit(dataTest[2], ['_id']));
    });
  });

  describe('Should return 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(getPath());

      expect(res.status).toBe(401);
    });
  });
});
