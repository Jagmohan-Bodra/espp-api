/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('PUT: //v1/enquiries/:id', () => {
  let token;
  let validId;
  let notExistsValidId = mongoose.Types.ObjectId();
  const fakeData = {
    name: 'i am a test',
    email: 'abc@gmail.com',
    contact: '0123456789',
    message: 'message',
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
    const { insertedId: productId } = await db
      .collection('products')
      .insertOne({ name: 'product' });
    const { insertedId } = await db
      .collection('enquiries')
      .insertOne({ ...fakeData, product: productId });
    validId = insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Happy case (200)', () => {
    it('Should Update success when input is valid', async () => {
      const updateData = {
        status: 'WON',
      };
      const res = await request(server)
        .put(`/v1/enquiries/${validId}`)
        .set('Authorization', 'Bearer ' + token)
        .send(updateData);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(updateData, ['_id']));
    });
  });

  describe('Test Authentication handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server).put(`/v1/enquiries/${validId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test Resource Not found handler (404)', () => {
    it('Should response BadRequest when "id" is not exist', async () => {
      const res = await request(server)
        .put(`/v1/enquiries/${notExistsValidId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });
});
