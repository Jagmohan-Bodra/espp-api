/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';
import { getObjectId } from '~/routes/utils';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test GET //v1/contacts/:contactId', () => {
  let token;
  let contactId;

  const contactData = {
    name: 'Green',
    email: 'email@email.com',
    contactNo: '0123456',
    message: 'message',
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
    const contact = await db.collection('contacts').insertOne(contactData);
    contactId = contact.insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Validation Handler (400)', () => {
    it('Should response BadRequest when contactId is Invalid', async () => {
      const res = await request(server)
        .get(`/v1/contacts/invalid-contactId`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
    });
  });

  describe('Test Resource Not found handler (404)', () => {
    it('Should response BadRequest when contactId is not exist', async () => {
      const res = await request(server)
        .get(`/v1/contacts/012345678901`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });
  describe('Return sttus 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/contacts/${contactId}`);

      expect(res.status).toBe(401);
    });
  });
  describe('Test Happy case Handler 200', () => {
    it('Should deleted successful when input is valid', async () => {
      const res = await request(server)
        .get(`/v1/contacts/${contactId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(contactData, ['_id']));
    });
  });
});
