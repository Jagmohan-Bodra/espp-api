/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import roles from '~/routes/constants/roles';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST: //orders/:orderId/send-email', () => {
  let token;
  let customerId;
  let validData;
  let productIds;
  let orderId;

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
      url: 'product-name-1as1',
      sku: 'PRODUCT_1',
      description: 'Description 1',
      publicPrice: 1.1,
      barcode: '10000123',
    },
    {
      name: 'product name 1as2',
      url: 'product-name-1as2',
      barcode: '10000124',
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

    const orderProductData = { productId: productIds[0], quantity: 2 };
    const orderProducts = await db
      .collection('order_product')
      .insertOne(orderProductData);
    const orderProductIds = orderProducts.insertedId;
    const orderData = {
      orderProducts: [orderProductIds],
      membership: membershipId,
      customer: customerId,
      status: 'PENDING',
    };
    const order = await db.collection('orders').insertOne(orderData);
    orderId = order.insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should success', async () => {
      const res = await request(server)
        .post(`/v1/orders/${orderId}/send-email`)
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'ORDER_INVOICE' });

      expect(res.status).toBe(200);
    });
    it('Should success', async () => {
      const res = await request(server)
        .post(`/v1/orders/${orderId}/send-email`)
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'ORDER_RECEIPT' });

      expect(res.status).toBe(200);
    });
    it('Should success', async () => {
      const res = await request(server)
        .post(`/v1/orders/${orderId}/send-email`)
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'ORDER_SLIP' });

      expect(res.status).toBe(200);
    });
  });

  describe('Return status 400:', () => {
    it('Should be failed when orderId is invalid', async () => {
      const res = await request(server)
        .post(`/v1/orders/invalid-order/send-email`)
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'ORDER_INVOICE' });

      expect(res.status).toBe(400);
    });
    it('Should be failed when type is invalid', async () => {
      const res = await request(server)
        .post(`/v1/orders/invalid-order/send-email`)
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'invalid-type' });

      expect(res.status).toBe(400);
    });
  });

  describe('Return status 404:', () => {
    it('Should be failed when order is not found', async () => {
      const res = await request(server)
        .post(`/v1/orders/012345678909/send-email`)
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'ORDER_INVOICE' });

      expect(res.status).toBe(404);
    });
  });

  describe('Return status 401:', () => {
    it('Should failed when token is not set', async () => {
      const res = await request(server)
        .post(`/v1/orders/${orderId}/send-email`)
        .send({ type: 'ORDER_INVOICE' });

      expect(res.status).toBe(401);
    });
  });
});
