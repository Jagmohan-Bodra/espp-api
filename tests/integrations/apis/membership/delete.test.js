/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import errorMessages from '~/routes/constants/error-messages';
import { getToken } from '../util';
import dataTest from './data-test';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test DELETE //v1/memberships/:id', () => {
  let token;
  let membershipId;
  const getPath = (membershipId) => `/v1/memberships/${membershipId}`;
  beforeAll(async () => {
    token = await getToken(request(server), db);

    const data = await db.collection('memberships').insertMany(dataTest);
    membershipId = data.insertedIds[0].toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful', async () => {
      const res = await request(server)
        .delete(getPath(membershipId))
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);

      expect(res.body.data).toMatchObject(_.omit(dataTest[0], ['_id']));
      const deletedMembershipr = await db
        .collection('memberships')
        .findOne({ _id: membershipId });

      expect(deletedMembershipr).toBeNull();
    });
  });

  describe('Return status 400', () => {
    it('Should response BadRequest when membershipId is invalid', async () => {
      const res = await request(server)
        .delete(getPath('invalid-membershipId'))
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
    });
  });

  describe('Return status 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).delete(getPath(membershipId));

      expect(res.status).toBe(401);
    });
  });

  describe('Return status 404', () => {
    it('Should be failed when membershipId is not found', async () => {
      const res = await request(server)
        .delete(getPath('123456789012'))
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(errorMessages.MEMBERSHIP_NOT_FOUND);
    });
  });
});
