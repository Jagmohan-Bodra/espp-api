/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('PUT: //v1/variants', () => {
  let token;
  let variantId;
  let notExistsValidId = mongoose.Types.ObjectId();
  const variants = [
    {
      group: 'group1',
      type: 'type1',
      label: 'label1',
      key: 'key1',
      value: 'value1',
    },
    {
      group: 'group2',
      type: 'type2',
      label: 'label2',
      key: 'key2',
      value: 'value2',
    },
    {
      group: 'group3',
      type: 'type3',
      label: 'label3',
      key: 'key3',
      value: 'value3',
    },
    {
      group: 'group4',
      type: 'type4',
      label: 'label4',
      key: 'key4',
      value: 'value4',
    },
  ];

  const validData = [
    {
      group: 'group1update',
      type: 'type1update',
      label: 'label1update',
      key: 'key1update',
      value: 'value1update',
    },
    {
      group: 'group2update',
      type: 'type2update',
      label: 'label2update',
      key: 'key2update',
      value: 'value2update',
    },
    {
      group: 'group3update',
      type: 'type3update',
      label: 'label3update',
      key: 'key3update',
      value: 'value3update',
    },
    {
      group: 'group4update',
      type: 'type4update',
      label: 'label4update',
      key: 'key4update',
      value: 'value4update',
    },
  ];

  beforeAll(async () => {
    token = await getToken(request(server), db);
    const { insertedIds } = await db
      .collection('variants')
      .insertMany(variants);
    variantId = insertedIds[0].toHexString();
    validData.map((variant, index) => {
      variant._id = insertedIds[index].toHexString();
    });
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Happy case (200)', () => {
    it('Should Update success when input is valid', async () => {
      const res = await request(server)
        .put(`/v1/variants`)
        .set('Authorization', 'Bearer ' + token)
        .send({ data: validData });

      expect(res.status).toBe(200);
    });
  });

  describe('Test Authentication handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server).put(`/v1/variants`);

      expect(res.status).toBe(401);
    });
  });

  describe('Return status 400:', () => {
    const badRequestData = validData[0];
    console.log('badRequestData', badRequestData);
    const testSuites = [
      {
        message: 'Should response BadRequest when type of "group" is wrong',
        data: [{ ...badRequestData, group: { a: 'a' } }],
      },
      {
        message: 'Should response BadRequest when type of "type" is wrong',
        data: [{ ...badRequestData, type: { a: 'a' } }],
      },
      {
        message: 'Should response BadRequest when type of "label" is wrong',
        data: [{ ...badRequestData, label: { a: 'a' } }],
      },
      {
        message: 'Should response BadRequest when type of "key" is wrong',
        data: [{ ...badRequestData, key: { a: 'a' } }],
      },
      {
        message: 'Should response BadRequest when type of "value" is wrong',
        data: [{ ...badRequestData, key: { a: 'a' } }],
      },
    ];

    for (let i = 0; i < testSuites.length; i++) {
      test.each(testSuites[i].data)(testSuites[i].message, async (testCase) => {
        testCase._id = variantId;
        const res = await request(server)
          .put(`/v1/variants`)
          .set('Authorization', 'Bearer ' + token)
          .send({ data: [testCase] });

        expect(res.status).toBe(400);
      });
    }
  });
});
