/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test GET //v1/pages/:id', () => {
  let validId;
  let notExistsValidId = mongoose.Types.ObjectId();
  const fakeData = {
    name: 'name',
    description: 'description',
    url: 'url',
    pushlish: true,
    styles: {
      object: 'object',
      style: 'style',
      styleCustomize: 'styleCustomize',
    },
    seoProps: {
      title: 'title',
      description: 'description',
      keywords: 'keywords',
      images: ['image1', 'image2'],
    },
  };

  beforeAll(async () => {
    const { insertedId } = await db.collection('pages').insertOne(fakeData);
    validId = insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful when "id" is exist', async () => {
      const res = await request(server).get(`/v1/pages/${validId}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(fakeData, ['_id']));
    });
  });

  describe('Return status 404', () => {
    it('Should failed when "id" is not exist', async () => {
      const res = await request(server).get(`/v1/pages/${notExistsValidId}`);

      expect(res.status).toBe(404);
    });
  });
});
