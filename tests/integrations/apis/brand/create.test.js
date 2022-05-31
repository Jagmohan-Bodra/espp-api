/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/brands', () => {
  let token;
  const fakeData = {
    name: 'Brand name 2',
    code: 'BRAND_2',
    image:
      'https://lh3.googleusercontent.com/proxy/4oXWiLjP3bFm_x4MkND4sgfPHuH7AYP0MQ3dcfrMh1jU_K3QXUVB4iCaLgXJnLxduXnJPr_EnoPnFkKCiFxpNMy0bgjJ_ZCmiYhIJTakhIXX2alNZMoRrw',
    description: 'Description 02',
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
      const res = await request(server).post(`/v1/brands`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server)
        .post(`/v1/brands`)
        .set('Authorization', 'Bearer ' + token)
        .send(fakeData);
      expect(res.status).toBe(200);
    });
  });
});
