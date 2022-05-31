/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getObjectId } from '~/routes/utils';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('PUT: //v1/products/:id', () => {
  let token;
  let validId;
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

  describe('Test Happy case (200)', () => {
    it('Should Update success when input is valid', async () => {
      const updateData = {
        name: 'product name update',
        sku: 'PRODUCT_1 update',
        description: 'Description update',
        publicPrice: 100,
        unit: '$  update',
        size: '1  update',
        typeAndMaterial: 'unknow update',
        uom: 'Uom  update',
        itemPackingSize: '20pc/packet  update',
        qtyPerCtn: '12pack/ctn update',
        taxApply: '1  update',
        status: 'ENABLED',
        published: false,
      };

      const res = await request(server)
        .put(`/v1/products/${validId}`)
        .set('Authorization', 'Bearer ' + token)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(updateData, ['_id']));
    });
  });

  describe('Test Authentication handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server).put(`/v1/products/${validId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test Validation Handler (400)', () => {
    it('Should response BadRequest when is Invalid', async () => {
      const res = await request(server)
        .put(`/v1/products/invalidId`)
        .set('Authorization', 'Bearer ' + token)
        .send(fakeData);
      expect(res.status).toBe(400);
    });
  });

  describe('Test Resource Not found handler (404)', () => {
    it('Should response BadRequest when "id" is not exist', async () => {
      const res = await request(server)
        .put(`/v1/products/60877ae54fefe41ec2776667`)
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(404);
    });
  });
});
