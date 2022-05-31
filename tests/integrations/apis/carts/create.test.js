/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { CUSTOMER_STATUS } from '~/routes/constants/master-data';
import roles from '~/routes/constants/roles';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/carts', () => {
  let token;
  let customerId;
  let validData;
  let productId;

  const userGroupData = {
    name: `name01`,
    description: 'description',
    active: true,
    roles: Object.values(roles),
  };

  const userData = {
    name: 'user01',
    email: 'user01@mail.com',
    phone: '0123456782',
    password: 'encrypted-password',
    validTokens: ['token01', 'token02'],
  };

  const productData = {
    name: 'product name 1as1',
    sku: 'PRODUCT_1',
    description: 'Description 1',
    publicPrice: 1.1,
  };

  const membershipData = { name: 'name', description: 'description' };
  const customerData = {
    email: 'test@gmail.com',
    phone: '123456879',
    firstName: 'firstName',
    lastName: 'lastName',
    status: CUSTOMER_STATUS.ACTIVE,
  };

  beforeAll(async () => {
    const userGroup = await db
      .collection('user_groups')
      .insertOne(userGroupData);
    userData.userGroup = userGroup.insertedId;
    const user = await db.collection('users').insertOne(userData);
    customerData.user = user.insertedId;
    const membership = await db
      .collection('memberships')
      .insertOne(membershipData);
    customerData.membership = membership.insertedId.toHexString();
    const customer = await db.collection('customers').insertOne(customerData);
    customerId = customer.insertedId.toHexString();
    const loginRes = await request(server)
      .post('/v1/auth/sign-in')
      .send(_.pick(userData, ['email', 'password']));
    token = loginRes.body.data.token;
    const product = await db.collection('products').insertOne(productData);
    productId = product.insertedId.toHexString();
    validData = { productId, quantity: 2 };
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should successful', async () => {
      const res = await request(server)
        .post(`/v1/carts`)
        .set('Authorization', 'Bearer ' + token)
        .send(validData);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ quantity: validData.quantity });
      expect(res.body.data.customer).toEqual(customerId);
      expect(res.body.data.product).toEqual(productId);
    });
  });
  describe('Return status 400:', () => {
    it('Should be failed when productId is invalid', async () => {
      const res = await request(server)
        .post(`/v1/carts`)
        .set('Authorization', 'Bearer ' + token)
        .send({ ...validData, productId: 'invalid-productId' });

      expect(res.status).toBe(400);
    });
  });

  describe('Return status 404:', () => {
    it('Should be failed when product is not found', async () => {
      const res = await request(server)
        .post(`/v1/carts`)
        .set('Authorization', 'Bearer ' + token)
        .send({ ...validData, productId: '012345678909' });

      expect(res.status).toBe(404);
    });
  });

  describe('Return status 401:', () => {
    it('Should be failed when token is no set', async () => {
      const res = await request(server)
        .post(`/v1/carts`)
        .send({ ...validData, productId: '012345678909' });

      expect(res.status).toBe(401);
    });
  });
});
