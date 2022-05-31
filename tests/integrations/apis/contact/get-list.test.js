/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test GET //v1/contacts', () => {
  let token;

  const contactData = [
    {
      name: 'Green1',
      email: 'email1@email.com',
      contactNo: '0123456',
      message: 'message1',
      readBy: '609aa8e00ac2d21c28e8e5cc',
      readAt: '2021-05-11T15:55:12.000Z',
      createdAt: '2021-05-11T15:55:12.873Z',
    },
    {
      name: 'Green2',
      email: 'email2@email.com',
      contactNo: '0123456',
      message: 'message2',
      readBy: '609aa8e00ac2d21c28e8e5cc',
      readAt: '2021-05-11T15:55:12.000Z',
      createdAt: '2021-05-11T15:55:12.873Z',
    },
    {
      name: 'Green3',
      email: 'email3@email.com',
      contactNo: '0123456',
      message: 'message3',
      readBy: '609aa8e00ac2d21c28e8e5cc',
      readAt: '2021-05-11T15:55:12.000Z',
      createdAt: '2021-05-11T15:55:12.873Z',
    },
    {
      name: 'Green4',
      email: 'email4@email.com',
      contactNo: '0123456',
      message: 'message4',
      readBy: '609aa8e00ac2d21c28e8e5cc',
      readAt: '2021-05-11T15:55:12.000Z',
      createdAt: '2021-05-11T15:55:12.873Z',
    },
    {
      name: 'Green5',
      email: 'email5@email.com',
      contactNo: '0123456',
      message: 'message5',
      readBy: '609aa8e00ac2d21c28e8e5cc',
      readAt: '2021-05-11T15:55:12.000Z',
      createdAt: '2021-05-11T15:55:12.873Z',
    },
    {
      name: 'Green6',
      email: 'email6@email.com',
      contactNo: '0123456',
      message: 'message6',
      readBy: '609aa8e00ac2d21c28e8e5cc',
      readAt: '2021-05-11T15:55:12.000Z',
      createdAt: '2021-05-11T15:55:12.873Z',
    },
    {
      name: 'yellow1',
      email: 'email7@email.com',
      contactNo: '0123456',
      message: 'message7',
      readBy: '609aa8e00ac2d21c28e8e5cc',
      readAt: '2021-05-11T15:55:12.000Z',
      createdAt: '2021-05-11T15:55:12.873Z',
    },
    {
      name: 'yellow2',
      email: 'email8@email.com',
      contactNo: '0123456',
      message: 'message8',
      readBy: '609aa8e00ac2d21c28e8e5cc',
      readAt: '2021-05-11T15:55:12.000Z',
      createdAt: '2021-05-11T15:55:12.873Z',
    },
    {
      name: 'yellow3',
      email: 'email9@email.com',
      contactNo: '0123456',
      message: 'message9',
      readBy: '609aa8e00ac2d21c28e8e5cc',
      readAt: '2021-05-11T15:55:12.000Z',
      createdAt: '2021-05-11T15:55:12.873Z',
    },
  ];

  beforeAll(async () => {
    token = await getToken(request(server), db);
    await db.collection('contacts').insertMany(contactData);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return sttus 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/contacts`);

      expect(res.status).toBe(401);
    });
  });
  describe('Test Happy case Handler 200', () => {
    it('Should deleted successful when input is valid', async () => {
      const res = await request(server)
        .get(`/v1/contacts`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(`/v1/contacts?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(9);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [], total: '9' },
      });
    });

    it('Should success when filter with name', async () => {
      const res = await request(server)
        .get(`/v1/contacts?name[regex]=yellow`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);

      res.body.data.map((item) => expect(item.name).toContain('yellow'));
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(`/v1/contacts?meta[pageSize]=3&meta[page]=2`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(`/v1/contacts?meta[pageSize]=4&meta[page]=2&meta[sort][]=-name`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(4);
    });
  });
});
