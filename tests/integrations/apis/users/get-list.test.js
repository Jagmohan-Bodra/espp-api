/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';
import { fakeUserGroup, fakeUsers } from './data';

const request = require('supertest');
const db = global.db;
const server = global.server;
let token;

describe('Test GET://v1/users', () => {
  beforeAll(async () => {
    await db.collection('users').deleteMany();
    await db.collection('user_groups').deleteMany();
    await db.collection('user_groups').insertMany([fakeUserGroup]);
    await db.collection('users').insertMany(fakeUsers);
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server)
        .get(`/v1/users`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(`/v1/users?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });

    it('Should success when filter with name', async () => {
      const res = await request(server)
        .get(`/v1/users?name[regex]=user03`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({ name: 'user03' });
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(`/v1/users?meta[pageSize]=2&meta[page]=2`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(`/v1/users?meta[pageSize]=2&meta[page]=2&meta[sort][]=-name`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('user02');
      expect(res.body.data[1].name).toBe('user01');
    });
  });
});
