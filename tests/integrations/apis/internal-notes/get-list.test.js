/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import ROLES from '~/routes/constants/roles';

const request = require('supertest');
const db = global.db;
const server = global.server;

describe('Test GET://v1/customer-internal-note/:customerId', () => {
  let token;
  let customerId;
  let userId;
  let internalNoteIds;

  const userGroupData = {
    name: 'Zadmin',
    roles: [ROLES.CUSTOMER_INTERNALNOTE_GETLIST],
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
  const validData = [
    { message: 'message1' },
    { message: 'message2' },
    { message: 'message3' },
    { message: 'message4' },
    { message: 'message5' },
    { message: 'message6' },
    { message: 'message7' },
    { message: 'message8' },
    { message: 'message9' },
    { message: 'message10' },
    { message: 'message11' },
    { message: 'message12' },
    { message: 'message13' },
    { message: 'message14' },
    { message: 'message15' },
  ];

  beforeAll(async () => {
    await db.collection('user_groups').deleteMany();
    await db.collection('users').deleteMany();
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
    validData.map((item) => {
      item.customer = customer.insertedId;
    });
    const internalNote = await db
      .collection('internal_notes')
      .insertMany(validData);
    internalNoteIds = Object.values(internalNote.insertedIds).map((item) =>
      item.toHexString(),
    );
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Should return 200', () => {
    it('Should success without any filter', async () => {
      const res = await request(server)
        .get(`/v1/customer-internal-note/${customerId}`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(10);
      expect(res.body.meta).toMatchObject({
        paginate: { pageSize: '10', page: '1', sort: [] },
      });
    });

    it('Should success and ignore all invalid filter', async () => {
      const res = await request(server)
        .get(`/v1/customer-internal-note/${customerId}` + `?wrongfield[w]=1`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(10);
    });

    it('Should success when filter with name', async () => {
      const res = await request(server)
        .get(
          `/v1/customer-internal-note/${customerId}` + `?message[regex]=age1`,
        )
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.map((item) => expect(item.message).toContain('age1'));
    });

    it('Should success when apply pagination', async () => {
      const res = await request(server)
        .get(
          `/v1/customer-internal-note/${customerId}` +
            `?meta[pageSize]=2&meta[page]=2`,
        )
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('Should success when apply sort', async () => {
      const res = await request(server)
        .get(
          `/v1/customer-internal-note/${customerId}` +
            `?meta[pageSize]=2&meta[page]=3&meta[sort][]=-message`,
        )
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('Return status 400:', () => {
    it('Should response BadRequest when customerId is invalid', async () => {
      const res = await request(server)
        .get(`/v1/customer-internal-note/invalid-customerId`)
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(400);
    });
  });

  describe('Should return 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).get(
        `/v1/customer-internal-note/${customerId}`,
      );

      expect(res.status).toBe(401);
    });
  });
});
