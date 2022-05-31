/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');
const db = global.db;
const server = global.server;
let token;

describe('Test GET://v1/settings', () => {
  const fakeUserGroups = [...Array(10)].map((_, index) => ({
    key: `key${index}`,
    value: 'value',
    module: 'TEMPLATE',
    group: 'EMAIL',
    label: 'Booking cancel email',
    hint: 'Booking cancel email template',
    inputType: 'richtext',
  }));

  beforeAll(async () => {
    await db.collection('settings').insertMany(fakeUserGroups);
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server)
        .get(`/v1/settings`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [], total: '10' },
      });
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(`/v1/settings?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });

    it('Should success when filter with key', async () => {
      const res = await request(server)
        .get(`/v1/settings?key[regex]=key3`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({ key: 'key3' });
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(`/v1/settings?meta[pageSize]=3&meta[page]=2`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(`/v1/settings?meta[pageSize]=3&meta[page]=2&meta[sort][]=-key`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject([
        { key: 'key6' },
        { key: 'key5' },
        { key: 'key4' },
      ]);
    });
  });

  describe('Should return 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/settings`);

      expect(res.status).toBe(401);
    });
  });
});
