/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/products', () => {
  let token;
  const fakeData = {
    name: 'product name 1as1',
    sku: 'PRODUCT_1',
    description: 'Description 1',
    publicPrice: 1.1,
    unit: '$',
    size: '1',
    typeAndMaterial: 'unknow',
    uom: 'Uom 1',
    itemPackingSize: '20pc/packet',
    qtyPerCtn: '12pack/ctn',
    taxApply: '1',
    status: 'ENABLED',
    published: true,
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Authorization (401)', () => {
    it('Should response 401 when token is not set', async () => {
      const res = await request(server).post(`/v1/products`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server)
        .post(`/v1/products`)
        .set('Authorization', 'Bearer ' + token)
        .send(fakeData);
      expect(res.status).toBe(200);
    });
  });
});
