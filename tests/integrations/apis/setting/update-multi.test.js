/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { getToken } from '../util';

const request = require('supertest');

const db = global.db;
const server = global.server;

describe('PUT: //v1/settings/update-bulk', () => {
  let token;
  let validIds;
  const fakeData = [
    {
      key: 'EMAIL_BOOKING_CANCEL_TEMPLATE',
      value: 'value',
      module: 'TEMPLATE',
      group: 'EMAIL',
      label: 'Booking cancel email',
      hint: 'Booking cancel email template',
      inputType: 'richtext',
    },
    {
      id: 2,
      key: 'EMAIL_BOOKING_COMPLETE_TEMPLATE',
      value: 'value 2',
      module: 'TEMPLATE',
      group: 'EMAIL',
      label: 'Booking complete email',
      hint: 'Booking complete email template',
      inputType: 'richtext',
    },
  ];

  beforeAll(async () => {
    token = await getToken(request(server), db);
    const { insertedIds } = await db
      .collection('settings')
      .insertMany(fakeData);
    validIds = insertedIds;
  });

  afterAll(async () => {
    await db.dropDatabase();
  });

  describe('Test Happy case (200)', () => {
    it('Should Update success when input is valid', async () => {
      const updateData = {
        data: [
          {
            _id: validIds[0].toHexString(),
            key: 'EMAIL_BOOKING_CANCEL_TEMPLATE',
            value: 'value 2',
            module: 'TEMPLATE',
            group: 'EMAIL',
            label: 'Booking cancel email',
            hint: 'Booking cancel email template',
            inputType: 'richtext',
          },
          {
            _id: validIds[1].toHexString(),
            key: 'EMAIL_BOOKING_COMPLETE_TEMPLATE',
            value: 'value 3',
            module: 'TEMPLATE',
            group: 'EMAIL',
            label: 'Booking complete email',
            hint: 'Booking complete email template',
            inputType: 'richtext',
          },
        ],
      };
      const res = await request(server)
        .put(`/v1/settings/update-bulk`)
        .set('Authorization', 'Bearer ' + token)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(updateData.data);
    });
  });

  describe('Test Authentication handler (401)', () => {
    it('Should create failed when token is not set', async () => {
      const res = await request(server).put(`/v1/settings/update-bulk`);
      expect(res.status).toBe(401);
    });
  });
});
