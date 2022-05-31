/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('PUT: //v1/post-categories/:id', () => {
  let token;
  let validId;
  let existsParentId;
  let notExistsValidId = mongoose.Types.ObjectId();
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

  beforeAll(async () => {
    token = await getToken(request(server), db);
    const { insertedId } = await db
      .collection('post_categories')
      .insertOne(fakeData);
    validId = insertedId.toHexString();

    const { insertedId: parentInsertedId } = await db
      .collection('post_categories')
      .insertOne(_.omit(fakeData, ['_id']));
    existsParentId = parentInsertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Happy case (200)', () => {
    it('Should Update success when input is valid', async () => {
      const updateData = {
        name: 'name1',
        description: 'description3',
        seoProps: {
          title: 'title4',
          description: 'description5',
          keywords: 'keywords6',
          images: ['string7'],
        },
        status: 'ENABLED',
        parent: existsParentId,
      };
      const res = await request(server)
        .put(`/v1/post-categories/${validId}`)
        .set('Authorization', 'Bearer ' + token)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(updateData, ['_id']));
    });
  });

  describe('Test Authentication handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server).put(`/v1/post-categories/${validId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test Validation Handler (400)', () => {
    it('Should response BadRequest when is Invalid', async () => {
      const res = await request(server)
        .put(`/v1/post-categories/${validId}`)
        .set('Authorization', 'Bearer ' + token)
        .send({ seoProps: 'string' });
      expect(res.status).toBe(400);
    });
  });

  describe('Test Resource Not found handler (404)', () => {
    it('Should response BadRequest when "id" is not exist', async () => {
      const res = await request(server)
        .put(`/v1/post-categories/${notExistsValidId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });
});
