/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/post-categories', () => {
  let token;
  const notExistsValidId = mongoose.Types.ObjectId();
  let validId;
  const fakeData = {
    name: 'name',
    url: 'url',
    description: 'description',
    seoProps: {
      title: 'title',
      description: 'description',
      keywords: 'keywords',
      images: ['string'],
    },
    status: 'ENABLED',
  };
  const parentData = {
    name: 'parent-name',
    url: 'url',
    description: 'description',
    seoProps: {
      title: 'title',
      description: 'description',
      keywords: 'keywords',
      images: ['string'],
    },
    status: 'ENABLED',
  };

  beforeAll(async () => {
    await db.collection('post_categories').deleteMany();
    token = await getToken(request(server), db);
    const { insertedId } = await db
      .collection('post_categories')
      .insertOne(parentData);
    validId = insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Authorization (401)', () => {
    it('Should response 401 when token is not set', async () => {
      const res = await request(server).post(`/v1/post-categories`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server)
        .post(`/v1/post-categories`)
        .set('Authorization', 'Bearer ' + token)
        .send({ ...fakeData, parent: validId });

      expect(res.status).toBe(200);
    });
  });

  describe('Test Validation Handler (400)', () => {
    it('Should response BadRequest when is Invalid', async () => {
      const res = await request(server)
        .post(`/v1/post-categories`)
        .set('Authorization', 'Bearer ' + token)
        .send({ seoProps: 'string' });
      expect(res.status).toBe(400);
    });
  });

  describe('Test Resource Not found handler (404)', () => {
    it('Should response BadRequest when "parent" is not exist', async () => {
      const res = await request(server)
        .post(`/v1/post-categories`)
        .set('Authorization', 'Bearer ' + token)
        .send({ ...fakeData, parent: notExistsValidId });

      expect(res.status).toBe(404);
    });
  });
});
