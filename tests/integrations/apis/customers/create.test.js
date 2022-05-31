/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */

import _ from 'lodash';
import { getToken } from '../util';
import errorMessages from '~/routes/constants/error-messages';

const request = require('supertest');

const db = global.db;
const server = global.server;
const getPath = () => `/v1/customers`;

describe('Test POST: //v1/customers', () => {
  let token;
  const validData = {
    customerCode: 'customer_code_01',
    email: 'test@gmail.com',
    phone: '123456879',
    firstName: 'firstName',
    lastName: 'lastName',
    remark: 'remarkTestCreate',
    designation: 'designationTestCreate',
    contactNo: '12345678',
    personalEmail: 'personalemail@gmail.com',
    status: 'ACTIVE',
    addressBlockNo: '123',
    addressStresstName: 'addressStresstNameTestCreate',
    addressFloor: 'addressFloorTestCreate',
    addressUnitNo: '1234',
    addressBuildingName: 'addressBuildingNameTestCreate',
    addressPostCode: 'addressPostCode',
    addressCity: 'addressCityTestCreate',
    addressState: 'addressStateTestCreate',
    addressCountry: 'addressCountryTestCreate',
    financeSalutation: 'financeSalutationTestCreate',
    financeFirstName: 'financeFirstNameTestCreate',
    financeLastName: 'financeLastNameTestCreate',
    financeContactNo: '12345678',
    financeEmail: 'financeEmail@gmail.com',
    companyName: 'companyNameTestCreate',
    companyRegNo: '123456789',
    companyContactNo: '123456789',
    companyFax: '123456789',
    companyNatureOfBusiness: 'companyNatureOfBusinessTestCreate',
  };

  beforeAll(async () => {
    token = await getToken(request(server), db);
    const membership = await db
      .collection('memberships')
      .insertOne({ name: 'name', description: 'description' });
    validData.membership = membership.insertedId.toHexString();
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200:', () => {
    it('Should success', async () => {
      const res = await request(server)
        .post(getPath())
        .set('Authorization', 'Bearer ' + token)
        .send(validData);

      expect(res.status).toBe(200);
      // expect(res.body.data).toMatchObject(validData);
    });
  });

  describe('Return status 400:', () => {
    const testSuites = [
      {
        message: 'Should response BadRequest when type of "remark" is wrong',
        data: [{ ...validData, remark: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when type of "designation" is wrong',
        data: [{ ...validData, designation: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "contactNo" is invalid',
        data: [{ ...validData, contactNo: '123456aa' }],
      },
      {
        message: 'Should response BadRequest when "personalEmail" is invalid',
        data: [{ ...validData, personalEmail: '123456aa' }],
      },
      {
        message: 'Should response BadRequest when type of "status" is wrong',
        data: [{ ...validData, status: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressBlockNo" is invalid',
        data: [{ ...validData, addressBlockNo: '123245aa' }],
      },
      {
        message:
          'Should response BadRequest when "addressStresstName" is invalid',
        data: [{ ...validData, addressStresstName: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressFloor" is invalid',
        data: [{ ...validData, addressFloor: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressUnitNo" is invalid',
        data: [{ ...validData, addressUnitNo: '12345aa' }],
      },
      {
        message:
          'Should response BadRequest when "addressBuildingName" is invalid',
        data: [{ ...validData, addressBuildingName: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressPostCode" is invalid',
        data: [{ ...validData, addressPostCode: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressCity" is invalid',
        data: [{ ...validData, addressCity: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressState" is invalid',
        data: [{ ...validData, addressState: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "addressCountry" is invalid',
        data: [{ ...validData, addressCountry: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when "financeSalutation" is invalid',
        data: [{ ...validData, financeSalutation: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when "financeFirstName" is invalid',
        data: [{ ...validData, financeFirstName: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "financeLastName" is invalid',
        data: [{ ...validData, financeLastName: [1, 2] }],
      },
      {
        message:
          'Should response BadRequest when "financeContactNo" is invalid',
        data: [{ ...validData, financeContactNo: '12345aa' }],
      },
      {
        message: 'Should response BadRequest when "financeEmail" is invalid',
        data: [{ ...validData, financeEmail: '12345aa' }],
      },
      {
        message: 'Should response BadRequest when "companyName" is invalid',
        data: [{ ...validData, companyName: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "companyRegNo" is invalid',
        data: [{ ...validData, companyRegNo: '12345aa' }],
      },
      {
        message:
          'Should response BadRequest when "companyContactNo" is invalid',
        data: [{ ...validData, companyContactNo: '12345aa' }],
      },
      {
        message: 'Should response BadRequest when "companyFax" is invalid',
        data: [{ ...validData, companyFax: '12345aa' }],
      },
      {
        message:
          'Should response BadRequest when "companyNatureOfBusiness" is invalid',
        data: [{ ...validData, companyNatureOfBusiness: [1, 2] }],
      },
      {
        message: 'Should response BadRequest when "membership" is invalid',
        data: [{ ...validData, membership: '1234355666' }],
      },
      {
        message: 'Should response BadRequest when "user" is invalid',
        data: [{ ...validData, user: '1234355666' }],
      },
    ];

    for (let i = 0; i < testSuites.length; i++) {
      test.each(testSuites[i].data)(testSuites[i].message, async (testCase) => {
        const res = await request(server)
          .post(getPath())
          .set('Authorization', 'Bearer ' + token)
          .send(testCase);

        expect(res.status).toBe(400);
      });
    }
  });

  describe('Return status 401:', () => {
    it('Should failed when token is not set', async () => {
      const res = await request(server)
        .post(getPath())
        .send({ ...validData, user: 'invalid-user' });
      expect(res.status).toBe(401);
    });
  });
});
