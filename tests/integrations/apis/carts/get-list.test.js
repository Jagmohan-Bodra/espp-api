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
  let cartData;
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
    cartData = [
      { productId, quantity: 1, customer: customer.insertedId },
      { productId, quantity: 2, customer: customer.insertedId },
      { productId, quantity: 3, customer: customer.insertedId },
      { productId, quantity: 4, customer: customer.insertedId },
      { productId, quantity: 5, customer: customer.insertedId },
      { productId, quantity: 6, customer: customer.insertedId },
      { productId, quantity: 7, customer: 'customer.insertedId' },
      { productId, quantity: 8, customer: 'customer.insertedId' },
    ];
    const cart = await db.collection('carts').insertMany(cartData);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should successful', async () => {
      const res = await request(server)
        .get(`/v1/carts`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toEqual(6);
    });
  });

  describe('Return status 401:', () => {
    it('Should be failed when token is no set', async () => {
      const res = await request(server).get(`/v1/carts`);

      expect(res.status).toBe(401);
    });
  });
});
