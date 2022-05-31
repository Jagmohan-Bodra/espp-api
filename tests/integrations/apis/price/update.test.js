/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

const request = require('supertest');
const { getToken } = require('../util');

const db = global.db;
const server = global.server;

describe('Test PUT //v1/product-price/:productId/:membershipId', () => {
  let token;
  let productId;
  let membershipId;

  const productData = {
    name: 'product name 1as1',
    publicPrice: 1.1,
  };
  const memberShipdata = {
    name: 'memberShip name',
    discountPercent: 5,
  };
  let validData;

  beforeAll(async () => {
    token = await getToken(request(server), db);

    const product = await db.collection('products').insertOne(productData);
    productId = product.insertedId.toHexString();

    const membership = await db
      .collection('memberships')
      .insertOne(memberShipdata);
    membershipId = membership.insertedId.toHexString();

    validData = {
      product: product.insertedId,
      membership: membership.insertedId,
      price: 105,
    };
    await db.collection('membership_products').insertOne(validData);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful', async () => {
      const res = await request(server)
        .put(`/v1/product-price/${productId}`)
        .set('Authorization', 'Bearer ' + token)
        .send({ membershipId, price: validData.price });

      expect(res.status).toBe(200);
    });
  });

  describe('Return status 400', () => {
    it('Should response BadRequest when productId is invalid', async () => {
      const res = await request(server)
        .put(`/v1/product-price/invalid-productId`)
        .set('Authorization', 'Bearer ' + token)
        .send({ membershipId, price: validData.price });
      expect(res.status).toBe(400);
    });
    it('Should response BadRequest when membershipId is invalid', async () => {
      const res = await request(server)
        .put(`/v1/product-price/invalid-productId`)
        .set('Authorization', 'Bearer ' + token)
        .send({ membershipId: 'membershipId', price: validData.price });
      expect(res.status).toBe(400);
    });
    it('Should response BadRequest when type of "price" is wrong', async () => {
      const res = await request(server)
        .put(`/v1/product-price/invalid-productId`)
        .set('Authorization', 'Bearer ' + token)
        .send({ membershipId, price: [1, 2, 3] });
      expect(res.status).toBe(400);
    });
  });

  describe('Return status 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).put(
        `/v1/product-price/${productId}/${membershipId}`,
      );

      expect(res.status).toBe(401);
    });
  });

  describe('Return status 404', () => {
    it('Should failed when productId is not found', async () => {
      const res = await request(server)
        .put(`/v1/product-price/123456789012/${membershipId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
    it('Should failed when membershipId is not found', async () => {
      const res = await request(server)
        .put(`/v1/product-price/${productId}/123456789012`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });
});
