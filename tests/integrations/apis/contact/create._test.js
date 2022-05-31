/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test POST://v1/contacts', () => {
  const validData = {
    name: 'Green',
    email: 'email@email.com',
    contactNo: '0123456',
    message: 'message',
  };

  beforeAll(async () => {
    await db.collection('contacts').deleteMany();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test happy case (200)', () => {
    it('Should be create successfully', async () => {
      const res = await request(server).post(`/v1/contacts`).send(validData);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(validData);
    });

    describe('Return status 400:', () => {
      const testSuites = [
        {
          message: 'Should response BadRequest when type of "name" is wrong',
          data: [{ ...validData, name: [1, 2] }],
        },
        {
          message: 'Should response BadRequest when type of "email" is wrong',
          data: [{ ...validData, email: 'email' }],
        },
        {
          message:
            'Should response BadRequest when type of "contactNo" is wrong',
          data: [{ ...validData, contactNo: [1, 2] }],
        },
        {
          message: 'Should response BadRequest when type of "message" is wrong',
          data: [{ ...validData, message: [1, 2] }],
        },
      ];

      for (let i = 0; i < testSuites.length; i++) {
        test.each(testSuites[i].data)(
          testSuites[i].message,
          async (testCase) => {
            const res = await request(server)
              .post(`/v1/contacts`)
              .send(testCase);

            expect(res.status).toBe(400);
          },
        );
      }
    });
  });
});
