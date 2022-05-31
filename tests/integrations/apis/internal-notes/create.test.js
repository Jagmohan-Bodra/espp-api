/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import ROLES from '~/routes/constants/roles';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST: //v1/customer-internal-note/:customerId', () => {
  let token;
  let customerId;
  let userId;

  const userGroupData = {
    name: 'Zadmin',
    roles: [ROLES.CUSTOMER_INTERNALNOTE_CREATE],
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
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should success', async () => {
      const res = await request(server)
        .post(`/v1/customer-internal-note/${customerId}`)
        .set('Authorization', 'Bearer ' + token)
        .send(validData);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(validData);
    });
  });

  describe('Return status 400:', () => {
    it('Should response BadRequest when customerId is invalid', async () => {
      const res = await request(server)
        .post(`/v1/customer-internal-note/invalid-customerId`)
        .set('Authorization', 'Bearer ' + token)
        .send(validData);

      expect(res.status).toBe(400);
    });

    it('Should response BadRequest when type of message is wrong', async () => {
      const res = await request(server)
        .post(`/v1/customer-internal-note/${customerId}`)
        .set('Authorization', 'Bearer ' + token)
        .send({ message: [1, 2, 3] });

      expect(res.status).toBe(400);
    });
  });

  describe('Return status 404:', () => {
    it('Should response failed when customer is not found', async () => {
      const res = await request(server)
        .post(`/v1/customer-internal-note/123456789012`)
        .set('Authorization', 'Bearer ' + token)
        .send({ ...validData });
      expect(res.status).toBe(404);
    });
  });

  describe('Return status 401:', () => {
    it('Should failed when token is not set', async () => {
      const res = await request(server)
        .post(`/v1/customer-internal-note/${customerId}`)
        .send({ ...validData });
      expect(res.status).toBe(401);
    });
  });
});
