/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import roles from '~/routes/constants/roles';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST: //v1/orders', () => {
  let token;
  let customerId;
  let validData;
  let productIdWithPriceInMembership;
  let productIdWithoutPriceInMembership;

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
      url: 'product_name_1as1',
      sku: 'PRODUCT_1',
      description: 'Description 1',
      publicPrice: 200,
      barcode: '12',
      quantity: 1000,
    },
    {
      name: 'product name 1as2',
      url: 'product_name_1as2',
      sku: 'PRODUCT_2',
      description: 'Description 2',
      publicPrice: 300,
      barcode: '11',
      quantity: 1000,
    },
  ];
  const membershipData = {
    name: 'name',
    description: 'description',
    discountPercent: 10,
  };
  const customerData = {
    email: 'test@gmail.com',
    phone: '123456879',
    firstName: 'firstName',
    lastName: 'lastName',
    status: 'ACTIVE',
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
    customerData.membership = membershipId;
    const customer = await db.collection('customers').insertOne(customerData);
    customerId = customer.insertedId.toHexString();
    const resData = await request(server)
      .post('/v1/auth/sign-in')
      .send(_.pick(userData, ['email', 'password']));
    token = resData.body.data.token;
    const product0 = await db.collection('products').insertOne(productData[0]);
    productIdWithPriceInMembership = product0.insertedId;
    const product1 = await db.collection('products').insertOne(productData[1]);
    productIdWithoutPriceInMembership = product1.insertedId;
    const membershipProduct = await db
      .collection('membership_products')
      .insertOne({
        membership: membershipId,
        product: productIdWithPriceInMembership,
        price: 150,
      });
    const cart1 = await db.collection('carts').insertOne({
      product: productIdWithPriceInMembership,
      customer: customer.insertedId,
      quantity: 2,
    });

    const cart2 = await db.collection('carts').insertOne({
      product: productIdWithoutPriceInMembership,
      customer: customer.insertedId,
      quantity: 3,
    });

    const cart3 = await db.collection('carts').insertOne({
      product: productIdWithPriceInMembership,
      customer: customer.insertedId,
      quantity: 2,
    });

    const cart4 = await db.collection('carts').insertOne({
      product: productIdWithoutPriceInMembership,
      customer: customer.insertedId,
      quantity: 3,
    });

    validData = [
      cart1.insertedId.toHexString(),
      cart2.insertedId.toHexString(),
      cart3.insertedId.toHexString(),
      cart4.insertedId.toHexString(),
    ];
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should success with special price for membership', async () => {
      const res = await request(server)
        .post(`/v1/orders`)
        .set('Authorization', 'Bearer ' + token)
        .send({ cartIds: [validData[0]] });
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(400);
      expect(res.body.data.membershipDiscount).toBe(100);
    });

    it('Should success without special price for membership', async () => {
      const res = await request(server)
        .post(`/v1/orders`)
        .set('Authorization', 'Bearer ' + token)
        .send({ cartIds: [validData[1]] });

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(900);
      expect(res.body.data.membershipDiscount).toBe(90);
    });

    it('Should success including both cases', async () => {
      const res = await request(server)
        .post(`/v1/orders`)
        .set('Authorization', 'Bearer ' + token)
        .send({ cartIds: [validData[2], validData[3]] });

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1300);
      expect(res.body.data.membershipDiscount).toBe(190);
    });
  });

  describe('Return status 400:', () => {
    it('Should response BadRequest when type of  cartIds is invalid', async () => {
      const res = await request(server)
        .post(`/v1/orders`)
        .set('Authorization', 'Bearer ' + token)
        .send({ cartIds: 'wrong-type' });

      expect(res.status).toBe(400);
    });
    it('Should response BadRequest when product is invalid', async () => {
      const res = await request(server)
        .post(`/v1/orders`)
        .set('Authorization', 'Bearer ' + token)
        .send({ cartIds: [...validData, 'invalid-cartIds'] });

      expect(res.status).toBe(400);
    });
    it('Should response BadRequest when type of quantity is invalid', async () => {
      const res = await request(server)
        .post(`/v1/orders`)
        .set('Authorization', 'Bearer ' + token)
        .send({
          orderProducts: {
            productId: productIdWithoutPriceInMembership,
            quantity: [1, 2],
          },
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Return status 401:', () => {
    it('Should failed when token is not set', async () => {
      const res = await request(server).post(`/v1/orders`).send(validData);

      expect(res.status).toBe(401);
    });
  });
});
