/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/sites', () => {
  let token;
  const fakeData = {
    name: 'name',
    avatar: 'avatar',
    seoPropDefault: {
      title: 'title',
      description: 'description',
      keywords: 'keywords',
      images: ['image1'],
    },
    status: 'status',
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Authorization (401)', () => {
    it('Should response 401 when token is not set', async () => {
      const res = await request(server).post(`/v1/sites`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server)
        .post(`/v1/sites`)
        .set('Authorization', 'Bearer ' + token)
        .send(fakeData);
      expect(res.status).toBe(200);
    });
  });

  describe('Test Validation Handler (400)', () => {
    it('Should response BadRequest when is Invalid', async () => {
      const res = await request(server)
        .post(`/v1/sites`)
        .set('Authorization', 'Bearer ' + token)
        .send({ seoPropDefault: ['string'] });
      expect(res.status).toBe(400);
    });
  });
});
