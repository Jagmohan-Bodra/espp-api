/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/posts', () => {
  let token;
  let existSiteId;
  const notExistSiteId = mongoose.Types.ObjectId();
  const fakeData = {
    name: 'name',
    description: 'description',
    url: 'url',
    avatar: 'avatar',
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

    await db.collection('post_categories').insertOne({
      name: 'string',
      url: 'string',
      description: 'string',
      parentId: 'string',
      seoProps: {
        title: 'string',
        description: 'string',
        keywords: 'string',
        images: ['string'],
      },
      status: 'string',
    });
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Authorization (401)', () => {
    it('Should response 401 when token is not set', async () => {
      const res = await request(server).post(`/v1/posts`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server)
        .post(`/v1/posts`)
        .set('Authorization', 'Bearer ' + token)
        .send({ ...fakeData, siteId: existSiteId, postCategoryId: [] });
      expect(res.status).toBe(200);
    });
  });

  describe('Test Validation Handler (400)', () => {
    // it('Should response BadRequest when is Invalid', async () => {
    //   const res = await request(server)
    //     .post(`/v1/posts`)
    //     .set('Authorization', 'Bearer ' + token)
    //     .send({});
    //   expect(res.status).toBe(400);
    // });

    it('Should response BadRequest when is Invalid', async () => {
      const res = await request(server)
        .post(`/v1/posts`)
        .set('Authorization', 'Bearer ' + token)
        .send({
          ...fakeData,
          siteId: existSiteId,
          postCategoryId: ['notObjectId'],
        });
      expect(res.status).toBe(400);
    });
  });

  describe('Test Validation Handler (404)', () => {
    // it('Should response BadRequest when "id" is not exist', async () => {
    //   const res = await request(server)
    //     .post(`/v1/posts`)
    //     .set('Authorization', 'Bearer ' + token)
    //     .send({ ...fakeData, siteId: notExistSiteId });
    //   expect(res.status).toBe(404);
    // });

    it('Should response BadRequest when "postCategoryId" is not exist', async () => {
      const res = await request(server)
        .post(`/v1/posts`)
        .set('Authorization', 'Bearer ' + token)
        .send({
          ...fakeData,
          siteId: existSiteId,
          postCategoryId: [notExistSiteId],
        });
      expect(res.status).toBe(404);
    });
  });
});
