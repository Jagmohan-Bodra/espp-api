/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test GET //v1/products/:id', () => {
  let token;
  let validId;
  let notExistsValidId = mongoose.Types.ObjectId();
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
    const { insertedId } = await db.collection('products').insertOne(fakeData);
    validId = insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful when "id" is exist', async () => {
      const res = await request(server)
        .get(`/v1/products/${validId}`)
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(fakeData, ['_id']));
    });
  });

  describe('Return status 404', () => {
    it('Should failed when "id" is not exist', async () => {
      const res = await request(server)
        .get(`/v1/products/${notExistsValidId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });
});
