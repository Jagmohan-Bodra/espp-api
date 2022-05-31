/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { CUSTOMER_STATUS } from '~/routes/constants/master-data';
import roles from '~/routes/constants/roles';
import { getObjectId } from '~/routes/utils';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test DELETE://v1/carts/:cartId', () => {
  let token;
  let customerId;
  let cartData;
  let productId;
  let cartId;

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
    cartData = {
      product: product.insertedId,
      quantity: 2,
      customer: customer.insertedId,
    };
    const cart = await db.collection('carts').insertOne(cartData);
    cartId = cart.insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should successful', async () => {
      const willBeDeletedCart = await db
        .collection('carts')
        .findOne({ _id: getObjectId(cartId) });
      expect(willBeDeletedCart._id.toHexString()).toEqual(cartId);
      const res = await request(server)
        .delete(`/v1/carts/${cartId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      const deletedCart = await db
        .collection('carts')
        .findOne({ _id: getObjectId(cartId) });
      expect(deletedCart).toBeNull();
    });
  });
  describe('Return status 400:', () => {
    it('Should be failed when cartId is invalid', async () => {
      const res = await request(server)
        .delete(`/v1/carts/invalid-cartId`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
    });
  });

  describe('Return status 404:', () => {
    it('Should be failed when product is not found', async () => {
      const res = await request(server)
        .delete(`/v1/carts/098765432123`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });

  describe('Return status 401:', () => {
    it('Should be failed when token is no set', async () => {
      const res = await request(server).delete(`/v1/carts/${cartId}`);

      expect(res.status).toBe(401);
    });
  });
});
