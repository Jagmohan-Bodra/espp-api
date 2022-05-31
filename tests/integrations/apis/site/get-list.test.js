/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');
const db = global.db;
const server = global.server;
let token;

describe('Test GET://v1/sites', () => {
  const fakeUserGroups = [...Array(10)].map((_, index) => ({
    name: `name${index}`,
    avatar: 'avatar',
    seoPropDefault: {
      title: 'title',
      description: 'description',
      keywords: 'keywords',
      images: ['image1'],
    },
    status: 'status',
  }));

  beforeAll(async () => {
    await db.collection('sites').insertMany(fakeUserGroups);
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server)
        .get(`/v1/sites`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [], total: '10' },
      });
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(`/v1/sites?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });

    it('Should success when filter with name', async () => {
      const res = await request(server)
        .get(`/v1/sites?name[regex]=name3`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({ name: 'name3' });
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(`/v1/sites?meta[pageSize]=3&meta[page]=2`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(`/v1/sites?meta[pageSize]=3&meta[page]=2&meta[sort][]=-name`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject([
        { name: 'name6' },
        { name: 'name5' },
        { name: 'name4' },
      ]);
    });
  });

  describe('Should return 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/sites`);

      expect(res.status).toBe(401);
    });
  });
});
