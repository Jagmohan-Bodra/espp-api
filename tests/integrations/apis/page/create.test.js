/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/pages', () => {
  let token;
  let existSiteId;
  const notExistSiteId = mongoose.Types.ObjectId();
  const fakeData = {
    name: 'name',
    description: 'description',
    url: 'url',
    pushlish: true,
    content: 'content',
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
    token = await getToken(request(server), db);
    const { insertedId } = await db.collection('sites').insertOne({
      name: 'name',
      avatar: 'avatar',
      seoPropDefault: {
        title: 'title',
        description: 'description',
        keywords: 'keywords',
        images: ['image1'],
      },
      status: 'status',
    });
    existSiteId = insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Authorization (401)', () => {
    it('Should response 401 when token is not set', async () => {
      const res = await request(server).post(`/v1/pages`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server)
        .post(`/v1/pages`)
        .set('Authorization', 'Bearer ' + token)
        .send({ ...fakeData, siteId: existSiteId });
      expect(res.status).toBe(200);
    });
  });

  // describe('Test Validation Handler (400)', () => {
  //   it('Should response BadRequest when is Invalid', async () => {
  //     const res = await request(server)
  //       .post(`/v1/pages`)
  //       .set('Authorization', 'Bearer ' + token)
  //       .send({});
  //     expect(res.status).toBe(400);
  //   });
  // });

  // describe('Test Validation Handler (404)', () => {
  //   it('Should response BadRequest when "id" is not exist', async () => {
  //     const res = await request(server)
  //       .post(`/v1/pages`)
  //       .set('Authorization', 'Bearer ' + token)
  //       .send({ ...fakeData, siteId: notExistSiteId });
  //     expect(res.status).toBe(404);
  //   });
  // });
});
