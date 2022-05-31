/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('PUT: //v1/pages/:id', () => {
  let token;
  let validId;
  let siteValidId;
  let notExistsValidId = mongoose.Types.ObjectId();
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
    const { insertedId } = await db.collection('pages').insertOne(fakeData);
    validId = insertedId.toHexString();

    const { insertedId: siteInsertedId } = await db
      .collection('sites')
      .insertOne({
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
    siteValidId = siteInsertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Happy case (200)', () => {
    it('Should Update success when input is valid', async () => {
      const updateData = {
        name: 'name 2',
        description: 'description 2',
        pushlish: true,
        content: 'content',
        styles: {
          object: 'object 2',
          style: 'style 2',
          styleCustomize: 'styleCustomize 2',
        },
        seoProps: {
          title: 'title 2',
          description: 'description 2',
          keywords: 'keywords 2',
          images: ['image3', 'image3'],
        },
      };
      const res = await request(server)
        .put(`/v1/pages/${validId}`)
        .set('Authorization', 'Bearer ' + token)
        .send({ ...updateData, siteId: siteValidId });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(updateData, ['_id']));
    });
  });

  describe('Test Authentication handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server).put(`/v1/pages/${validId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Test Validation Handler (400)', () => {
    it('Should response BadRequest when is Invalid', async () => {
      const res = await request(server)
        .put(`/v1/pages/${validId}`)
        .set('Authorization', 'Bearer ' + token)
        .send({ seoProps: 'string' });
      expect(res.status).toBe(400);
    });
  });

  describe('Test Resource Not found handler (404)', () => {
    it('Should response BadRequest when "id" is not exist', async () => {
      const res = await request(server)
        .put(`/v1/pages/${notExistsValidId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });

    //   it('Should response BadRequest when "siteId" is not exist', async () => {
    //     const updateData = {
    //       name: 'name 4',
    //       description: 'description 4',
    //       url: 'url 4',
    //       pushlish: false,
    //       styles: {
    //         object: 'object 4',
    //         style: 'style 4',
    //         styleCustomize: 'styleCustomize 4',
    //       },
    //       seoProps: {
    //         title: 'title 4',
    //         description: 'description 4',
    //         keywords: 'keywords 4',
    //         images: ['image5', 'image5'],
    //       },
    //     };

    //     const res = await request(server)
    //       .put(`/v1/pages/${validId}`)
    //       .set('Authorization', 'Bearer ' + token)
    //       .send({ ...updateData, siteId: notExistsValidId });
    //     expect(res.status).toBe(404);
    //   });
  });
});
