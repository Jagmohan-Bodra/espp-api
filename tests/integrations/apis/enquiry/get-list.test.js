/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');
const db = global.db;
const server = global.server;
let token;

describe('Test GET://v1/enquiries', () => {
  const fakeUserGroups = [...Array(10)].map((_, index) => ({
    name: `i am a test ${index}`,
    email: 'abc@gmail.com',
    contact: '0123456789',
    message: 'message',
  }));

  beforeAll(async () => {
    await db.collection('enquiries').insertMany(fakeUserGroups);
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server)
        .get(`/v1/enquiries`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [], total: '10' },
      });
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(`/v1/enquiries?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });

    it('Should success when filter with name', async () => {
      const res = await request(server)
        .get(`/v1/enquiries?name[regex]=name3`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(`/v1/enquiries?meta[pageSize]=3&meta[page]=2`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(`/v1/enquiries?meta[pageSize]=3&meta[page]=2&meta[sort][]=-name`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });
  });

  describe('Should return 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/enquiries`);
      expect(res.status).toBe(401);
    });
  });
});
