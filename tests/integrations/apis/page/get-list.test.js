/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';

const request = require('supertest');
const db = global.db;
const server = global.server;

describe('Test GET://v1/pages', () => {
  const fakeUserGroups = [...Array(10)].map((_, index) => ({
    name: `name${index}`,
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
  }));

  beforeAll(async () => {
    await db.collection('pages').insertMany(fakeUserGroups);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server).get(`/v1/pages`);

      expect(res.status).toBe(200);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [], total: '10' },
      });
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server).get(`/v1/pages?wrongfield[w]=1`);

      expect(res.status).toBe(200);
    });

    it('Should success when filter with name', async () => {
      const res = await request(server).get(`/v1/pages?name[regex]=name3`);

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({ name: 'name3' });
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server).get(
        `/v1/pages?meta[pageSize]=3&meta[page]=2`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server).get(
        `/v1/pages?meta[pageSize]=3&meta[page]=2&meta[sort][]=-name`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject([
        { name: 'name6' },
        { name: 'name5' },
        { name: 'name4' },
      ]);
    });
  });
});
