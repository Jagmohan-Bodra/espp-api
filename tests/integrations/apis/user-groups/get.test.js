/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;
let token;

describe('Test GET //v1/user-groups/:id', () => {
  let token;
  let validId;
  let notExistsValidId = mongoose.Types.ObjectId();
  const fakeData = {
    name: `name01`,
    description: 'description',
    active: true,
    roles: ['/v1/users/get-list', '/v1/users/{id}/get'],
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
    const { insertedId } = await db
      .collection('user_groups')
      .insertOne(fakeData);
    validId = insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful when "id" is exist', async () => {
      const res = await request(server)
        .get(`/v1/user-groups/${validId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(_.omit(fakeData, ['_id']));
    });
  });

  describe('Return status 404', () => {
    it('Should failed when "id" is not exist', async () => {
      const res = await request(server)
        .get(`/v1/user-groups/${notExistsValidId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });

  describe('Should return 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/user-groups/${validId}`);

      expect(res.status).toBe(401);
    });
  });
});
