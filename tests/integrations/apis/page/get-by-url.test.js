/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST //v1/pages-url', () => {
  let validData;
  let pageId;
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
    const page = await db.collection('pages').insertOne(fakeData);
    pageId = page.insertedId.toHexString();
    validData = { url: fakeData.url };
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful', async () => {
      const res = await request(server).post(`/v1/page-url`).send(validData);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toEqual(pageId);
      expect(res.body.data).toMatchObject(validData);
    });
  });

  describe('Return status 404', () => {
    it('Should failed when page is not found', async () => {
      const res = await request(server)
        .post(`/v1/page-url`)
        .send({ url: 'not-found-url' });

      expect(res.status).toBe(404);
    });
  });
});
