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

describe('Test DELETE://v1/carts', () => {
  let token;
  let customerId;
  let cartData;
  let productIds;

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
      name: 'product name 2',
      sku: 'PRODUCT_2',
      description: 'Description 2',
      publicPrice: 2,
    },
    {
      name: 'product name 1',
      sku: 'PRODUCT_1',
      description: 'Description 1',
      publicPrice: 1,
    },
    {
      name: 'product name 3',
      sku: 'PRODUCT_3',
      description: 'Description 3',
      publicPrice: 3,
    },
  ];

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
    customerId = customer.insertedId;
    const loginRes = await request(server)
      .post('/v1/auth/sign-in')
      .send(_.pick(userData, ['email', 'password']));
    token = loginRes.body.data.token;
    const products = await db.collection('products').insertMany(productData);
    productIds = Object.values(products.insertedIds);
    cartData = [
      {
        product: productIds[0],
        quantity: 20,
        customer: customer.insertedId,
      },
      {
        product: productIds[1],
        quantity: 30,
        customer: customer.insertedId,
      },
      {
        product: productIds[2],
        quantity: 40,
        customer: customer.insertedId,
      },
    ];
    await db.collection('carts').insertMany(cartData);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should successful', async () => {
      const numberOfCarts = await db.collection('carts').find({}).count();
      expect(numberOfCarts).toBe(3);

      const res = await request(server)
        .delete(`/v1/carts`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);

      const numberOfCartsAfterDeleteAll = await db
        .collection('carts')
        .find({ customer: customerId })
        .count();
      expect(numberOfCartsAfterDeleteAll).toBe(0);
    });
  });

  describe('Return status 401:', () => {
    it('Should be failed when token is no set', async () => {
      const res = await request(server).delete(`/v1/carts`);

      expect(res.status).toBe(401);
    });
  });
});
