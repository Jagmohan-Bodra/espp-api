/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('PUT: //v1/brands/:id', () => {
  let token;
  let validId;
  let notExistsValidId = mongoose.Types.ObjectId();
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
    const { insertedId } = await db.collection('brands').insertOne(fakeData);
    validId = insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Happy case (200)', () => {
    it('Should Update success when input is valid', async () => {
      const updateData = {
        name: `name 1`,
        status: 'ENABLED',
      };
      const res = await request(server)
        .put(`/v1/brands/${validId}`)
        .set('Authorization', 'Bearer ' + token)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(updateData, ['_id']));
    });
  });

  describe('Test Authentication handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server).put(`/v1/brands/${validId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test Resource Not found handler (404)', () => {
    it('Should response BadRequest when "id" is not exist', async () => {
      const res = await request(server)
        .put(`/v1/brands/${notExistsValidId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });
});
