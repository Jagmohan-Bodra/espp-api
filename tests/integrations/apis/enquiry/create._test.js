/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/enquiries', () => {
  let token;
  let productId;
  const fakeData = {
    name: 'i am a test',
    email: 'abc@gmail.com',
    contact: '0123456789',
    message: 'message',
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
    const { insertedId } = await db
      .collection('products')
      .insertOne({ name: 'product' });
    productId = insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server)
        .post(`/v1/enquiries`)
        .set('Authorization', 'Bearer ' + token)
        .send({ ...fakeData, product: productId });
      expect(res.status).toBe(200);
    });
  });
});
