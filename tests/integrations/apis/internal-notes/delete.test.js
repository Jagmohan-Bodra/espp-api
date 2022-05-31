/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import ROLES from '~/routes/constants/roles';
const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test DELETE //v1/customer-internal-note/:customerId/:internalNoteId', () => {
  let token;
  let customerId;
  let userId;
  let internalNoteId;

  const userGroupData = {
    name: 'Zadmin',
    roles: [ROLES.CUSTOMER_INTERNALNOTE_DELETE],
  };
  const userData = {
    name: 'Mr. Admin',
    phone: '0923456789',
    email: 'admin@email.com',
    password: 'md5-hash-pass',
    validTokens: ['abcde', '123456'],
  };

  const customerData = {
    contactNo: '012345678',
    personalEmail: 'customer@emali.com',
  };
  const validData = { message: 'message' };

  beforeAll(async () => {
    const userGroup = await db
      .collection('user_groups')
      .insertOne(userGroupData);
    userData.userGroup = userGroup.insertedId.toHexString();
    const user = await db.collection('users').insertOne(userData);
    const loginResponse = await request(server)
      .post('/v1/auth/sign-in')
      .send({ email: userData.email, password: userData.password });
    token = loginResponse.body.data.token;
    userId = user.insertedId.toHexString();
    const customer = await db.collection('customers').insertOne(customerData);
    customerId = customer.insertedId.toHexString();
    validData.customer = customerId;
    const internalNote = await db
      .collection('internal_notes')
      .insertOne(validData);
    internalNoteId = internalNote.insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful', async () => {
      const res = await request(server)
        .delete(`/v1/customer-internal-note/${customerId}/${internalNoteId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);

      expect(res.body.data).toMatchObject({ message: validData.message });
      const deletedInternalNote = await db
        .collection('internal_notes')
        .findOne({ _id: internalNoteId });

      expect(deletedInternalNote).toBeNull();
    });
  });

  describe('Return status 400', () => {
    it('Should response BadRequest when customerId is invalid', async () => {
      const res = await request(server)
        .delete(
          `/v1/customer-internal-note/invalid-customerId/${internalNoteId}`,
        )
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
    });
    it('Should response BadRequest when internalNoteId is invalid', async () => {
      const res = await request(server)
        .delete(
          `/v1/customer-internal-note/${customerId}/invalid-internalNoteId`,
        )
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
    });
  });

  describe('Return status 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).delete(
        `/v1/customer-internal-note/${customerId}/${internalNoteId}`,
      );

      expect(res.status).toBe(401);
    });
  });

  describe('Return status 404', () => {
    it('Should failed when customerId is not found', async () => {
      const res = await request(server)
        .delete(`/v1/customer-internal-note/012345678912/${internalNoteId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
    it('Should failed when internalNoteId is not found', async () => {
      const res = await request(server)
        .delete(`/v1/customer-internal-note/${customerId}/012345678912`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });
});
