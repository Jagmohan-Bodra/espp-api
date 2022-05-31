/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

const request = require('supertest');
const { getToken } = require('../util');

const db = global.db;
const server = global.server;

describe('Test GET //v1/product-price/:productId/:membershipId', () => {
  let token;
  let productId;
  let membershipIds;

  const productData = {
    name: 'product name 1as1',
    publicPrice: 1.1,
  };
  const memberShipdata = [
    {
      name: 'memberShip name 1',
      discountPercent: 1,
    },
    {
      name: 'memberShip name 2',
      discountPercent: 2,
    },
    {
      name: 'memberShip name 3',
      discountPercent: 3,
    },
    {
      name: 'memberShip name 4',
      discountPercent: 4,
    },
  ];
  let validData;

  beforeAll(async () => {
    token = await getToken(request(server), db);

    const product = await db.collection('products').insertOne(productData);
    productId = product.insertedId.toHexString();

    const membership = await db
      .collection('memberships')
      .insertMany(memberShipdata);
    membershipIds = Object.values(membership.insertedIds);

    validData = [
      {
        product: product.insertedId,
        membership: membershipIds[0],
        price: 105,
      },
    ];

    await db.collection('membership_products').insertMany(validData);
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful', async () => {
      const res = await request(server)
        .get(`/v1/product-price/${productId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);

      expect(res.body.data.length).toBe(4);

      const beSetPrice = res.body.data.find(
        (item) => item.membership === validData[0].membership.toHexString(),
      );

      expect(beSetPrice).toMatchObject({ price: validData[0].price });
    });
  });

  describe('Return status 400', () => {
    it('Should response BadRequest when productId is invalid', async () => {
      const res = await request(server)
        .get(`/v1/product-price/invalid-productId`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
    });
  });

  describe('Return status 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(`/v1/product-price/${productId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Return status 404', () => {
    it('Should failed when productId is not found', async () => {
      const res = await request(server)
        .get(`/v1/product-price/123456789012`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(404);
    });
  });
});
