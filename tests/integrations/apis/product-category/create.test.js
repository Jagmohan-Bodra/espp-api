/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/product-categories', () => {
  let token;
  const fakeData = {
    name: 'production categories 1',
    code: 'CATEGORIES_1',
    image:
      'https://kiemtienbaobao.com/wp-content/uploads/2019/02/Category-l%C3%A0-g%C3%AC-2-728x400.jpg',
    description: 'Description 01',
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
      const res = await request(server).post(`/v1/product-categories`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server)
        .post(`/v1/product-categories`)
        .set('Authorization', 'Bearer ' + token)
        .send(fakeData);
      expect(res.status).toBe(200);
    });
  });
});
