/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');
const db = global.db;
const server = global.server;
let token;

describe('Test GET://v1/products', () => {
  const fakeUserGroups = [...Array(10)].map((_, index) => ({
    name: `name${index}`,
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
  }));

  beforeAll(async () => {
    await db.collection('products').insertMany(fakeUserGroups);
    token = await getToken(request(server), db);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server)
        .get(`/v1/products`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [], total: '10' },
      });
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(`/v1/products?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });

    it('Should success when filter with name', async () => {
      const res = await request(server)
        .get(`/v1/products?name[regex]=name3`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({ name: 'name3' });
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(`/v1/products?meta[pageSize]=3&meta[page]=2`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(`/v1/products?meta[pageSize]=3&meta[page]=2&meta[sort][]=-name`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject([
        { name: 'name6' },
        { name: 'name5' },
        { name: 'name4' },
      ]);
    });
  });
});
