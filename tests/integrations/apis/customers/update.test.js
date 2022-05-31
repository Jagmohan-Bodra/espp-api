/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import { getToken } from '../util';
import dataTest from './data-test';
import errorMessages from '~/routes/constants/error-messages';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('Test PUT //v1/customer/:id', () => {
  let token;
  let customerId;
  const validData = {
    remark: 'remarkTestUpdate',
    designation: 'designationTestUpdate',
    contactNo: '12345678',
    personalEmail: 'personalemail@gmail.com',
    status: 'ACTIVE',
    addressBlockNo: '123',
    addressStresstName: 'addressStresstNameTestUpdate',
    addressFloor: 'addressFloorTestUpdate',
    addressUnitNo: '1234',
    addressBuildingName: 'addressBuildingNameTestUpdate',
    addressPostCode: 'addressPostCode',
    addressCity: 'addressCityTestUpdate',
    addressState: 'addressStateTestUpdate',
    addressCountry: 'addressCountryTestUpdate',
    financeSalutation: 'financeSalutationTestUpdate',
    financeFirstName: 'financeFirstNameTestUpdate',
    financeLastName: 'financeLastNameTestUpdate',
    financeContactNo: '12345678',
    financeEmail: 'financeEmail@gmail.com',
    companyName: 'companyNameTestUpdate',
    companyRegNo: '123456789',
    companyContactNo: '123456789',
    companyFax: '123456789',
    companyNatureOfBusiness: 'companyNatureOfBusinessTestUpdate',
  };

  const getPath = (customerId) => `/v1/customers/${customerId}`;

  beforeAll(async () => {
    token = await getToken(request(server), db);

    const data = await db.collection('customers').insertMany(dataTest);
    customerId = data.insertedIds[0].toHexString();

    const user = await db.collection('users').findOne({});
    validData.user = user._id.toHexString();
    const membership = await db
      .collection('memberships')
      .insertOne({ name: 'name', description: 'description' });
    validData.membership = membership.insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should be successful', async () => {
      const res = await request(server)
        .put(getPath(customerId))
        .set('Authorization', 'Bearer ' + token)
        .send(validData);

      expect(res.status).toBe(200);
    });
  });

  describe('Return status 400', () => {
    it('Should response BadRequest when customerId is invalid', async () => {
      const res = await request(server)
        .put(getPath('invalid-customerId'))
        .set('Authorization', 'Bearer ' + token)
        .send(validData);
      expect(res.status).toBe(400);
    });

    const testSuites = [
      {
        message: 'Should response BadRequest when type of "remark" is wrong',
        data: [{ remark: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when type of "designation" is wrong',
        data: [{ designation: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "contactNo" is invalid',
        data: [{ contactNo: [1, 2, 3] }],
      },
      {
        message: 'Should response BadRequest when "personalEmail" is invalid',
        data: [{ personalEmail: '123456aa' }],
      },
      {
        message: 'Should response BadRequest when type of "status" is wrong',
        data: [{ status: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressBlockNo" is invalid',
        data: [{ addressBlockNo: [1, 2, 3] }],
      },
      {
        message:
          'Should response BadRequest when "addressStresstName" is invalid',
        data: [{ addressStresstName: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressFloor" is invalid',
        data: [{ addressFloor: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressUnitNo" is invalid',
        data: [{ addressUnitNo: [1, 2, 3] }],
      },
      {
        message:
          'Should response BadRequest when "addressBuildingName" is invalid',
        data: [{ addressBuildingName: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressPostCode" is invalid',
        data: [{ addressPostCode: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressCity" is invalid',
        data: [{ addressCity: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressState" is invalid',
        data: [{ addressState: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressCountry" is invalid',
        data: [{ addressCountry: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when "financeSalutation" is invalid',
        data: [{ financeSalutation: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when "financeFirstName" is invalid',
        data: [{ financeFirstName: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "financeLastName" is invalid',
        data: [{ financeLastName: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when "financeContactNo" is invalid',
        data: [{ financeContactNo: [1, 2, 3] }],
      },
      {
        message: 'Should response BadRequest when "financeEmail" is invalid',
        data: [{ financeEmail: '12345aa' }],
      },
      {
        message: 'Should response BadRequest when "companyName" is invalid',
        data: [{ companyName: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "companyRegNo" is invalid',
        data: [{ companyRegNo: [1, 2, 3] }],
      },
      {
        message:
          'Should response BadRequest when "companyContactNo" is invalid',
        data: [{ companyContactNo: [1, 2, 3] }],
      },
      {
        message: 'Should response BadRequest when "companyFax" is invalid',
        data: [{ companyFax: [1, 2, 3] }],
      },
      {
        message:
          'Should response BadRequest when "companyNatureOfBusiness" is invalid',
        data: [{ companyNatureOfBusiness: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "membership" is invalid',
        data: [{ membership: '1234355666' }],
      },
      {
        message: 'Should response BadRequest when "user" is invalid',
        data: [{ user: '1234355666' }],
      },
    ];

    for (let i = 0; i < testSuites.length; i++) {
      test.each(testSuites[i].data)(testSuites[i].message, async (testCase) => {
        const res = await request(server)
          .put(getPath(customerId))
          .set('Authorization', 'Bearer ' + token)
          .send(testCase);

        expect(res.status).toBe(400);
      });
    }
  });

  describe('Return status 401', () => {
    it('Should be failed when token is not set', async () => {
      const res = await request(server).put(getPath(customerId));

      expect(res.status).toBe(401);
    });
  });

  // describe('Return status 404', () => {
  //   it('Should be failed when customer is not found', async () => {
  //     const res = await request(server)
  //       .get(getPath('123456789012'))
  //       .set('Authorization', 'Bearer ' + token);

  //     expect(res.status).toBe(404);
  //     expect(res.body.message).toBe(errorMessages.CUSTOMER_NOT_FOUND);
  //   });
  //   it('Should be failed when customer is not found', async () => {
  //     const res = await request(server)
  //       .put(getPath('123456789012'))
  //       .set('Authorization', 'Bearer ' + token);

  //     expect(res.status).toBe(404);
  //     expect(res.body.message).toBe(errorMessages.CUSTOMER_NOT_FOUND);
  //   });
  //   it('Should failed when user is not found', async () => {
  //     const res = await request(server)
  //       .put(getPath(customerId))
  //       .set('Authorization', 'Bearer ' + token)
  //       .send({ user: '123456789012' });
  //     expect(res.status).toBe(404);
  //     expect(res.body.message).toBe(errorMessages.USER_NOT_FOUND);
  //   });

  //   // TODO: hot-fix
  //   // it('Should failed when membership is not found', async () => {
  //   //   const res = await request(server)
  //   //     .put(getPath(customerId))
  //   //     .set('Authorization', 'Bearer ' + token)
  //   //     .send({ membership: '123456789012' });
  //   //   expect(res.status).toBe(404);
  //   //   expect(res.body.message).toBe(errorMessages.MEMBERSHIP_NOT_FOUND);
  //   // });

  // });
});
