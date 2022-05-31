/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/tags', () => {
  let token;
  const fakeData = {
    name: 'Tag 1',
    description: 'tag description 01',
    status: 'ENABLED',
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Authorization (401)', () => {
    it('Should response 401 when token is not set', async () => {
      const res = await request(server).post(`/v1/tags`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server)
        .post(`/v1/tags`)
        .set('Authorization', 'Bearer ' + token)
        .send(fakeData);
      expect(res.status).toBe(200);
    });
  });
});
