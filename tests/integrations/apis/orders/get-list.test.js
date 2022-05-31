/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import roles from '~/routes/constants/roles';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test GET: //v1/orders', () => {
  let token;
  let customerId;
  let validData;
  let productIds;
  let orderIds;

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

  const productData = [
    {
      name: 'product name 1as1',
      sku: 'PRODUCT_1',
      description: 'Description 1',
      publicPrice: 1.1,
    },
    {
      name: 'product name 1as2',
      sku: 'PRODUCT_2',
      description: 'Description 2',
      publicPrice: 1.2,
    },
  ];
  const membershipData = { name: 'name', description: 'description' };
  const customerData = {
    email: 'test@gmail.com',
    phone: '123456879',
    firstName: 'firstName',
    lastName: 'lastName',
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
    const membershipId = membership.insertedId;
    customerData.membership = membership.insertedId.toHexString();
    const customer = await db.collection('customers').insertOne(customerData);
    customerId = customer.insertedId.toHexString();
    const resData = await request(server)
      .post('/v1/auth/sign-in')
      .send(_.pick(userData, ['email', 'password']));
    token = resData.body.data.token;

    const products = await db.collection('products').insertMany(productData);
    productIds = Object.values(products.insertedIds);
    const orderProductData = [
      { productId: productIds[0], quantity: 2 },
      { productId: productIds[1], quantity: 3 },
      { productId: productIds[0], quantity: 5 },
      { productId: productIds[1], quantity: 6 },
      { productId: productIds[1], quantity: 8 },
    ];

    const orderProducts = await db
      .collection('order_product')
      .insertMany(orderProductData);
    const orderProductIds = Object.values(orderProducts.insertedIds);
    const orderData = [
      {
        orderProducts: [orderProductIds[0]],
        membership: membershipId,
        customer: customerId,
        status: 'PENDING',
      },
      {
        orderProducts: [orderProductIds[1]],
        membership: membershipId,
        customer: customerId,
        status: 'PENDING',
      },
      {
        orderProducts: [orderProductIds[2]],
        membership: membershipId,
        customer: customerId,
        status: 'PENDING',
      },
      {
        orderProducts: [orderProductIds[3]],
        membership: membershipId,
        customer: customerId,
        status: 'PENDING',
      },
      {
        orderProducts: [orderProductIds[4]],
        membership: membershipId,
        customer: customerId,
        status: 'PENDING',
      },
    ];
    const order = await db.collection('orders').insertMany(orderData);
    orderIds = Object.values(order.insertedIds);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should success', async () => {
      const res = await request(server)
        .get(`/v1/orders`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
    });
  });

  describe('Return status 401:', () => {
    it('Should failed when token is not set', async () => {
      const res = await request(server).get(`/v1/orders`).send(validData);

      expect(res.status).toBe(401);
    });
  });
});
