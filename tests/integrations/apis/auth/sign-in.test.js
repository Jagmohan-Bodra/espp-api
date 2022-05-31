/**
 * @jest-environment ./tests/integrations/global/TestEnvironment.js
 */
import _ from 'lodash';
import { interfaceVersion } from 'eslint-import-resolver-babel-plugin-root-import';

const request = require('supertest');

const db = global.db;
const server = global.server;

let validUser;
let inactiveUser;

describe('/v1/auth/sign-in', () => {
  const jwtTokenRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
  validUser = {
    name: 'Mr. Admin',
    phone: '0923456789',
    email: 'admin@email.com',
    password: 'md5-hash-pass',
  };

  inactiveUser = {
    name: 'Mr. Inactive',
    phone: '0923456711',
    email: 'inactive@email.com',
    password: 'md5-hash-pass',
    active: false,
  };

  const userGroupMock = {
    name: 'admin',
    roles: ['/cms/pages/list', '/cms/pages/create'],
  };

  beforeEach(async () => {
    const userGroup = await db
      .collection('user_groups')
      .insertOne(userGroupMock);

    validUser.userGroup = userGroup.insertedId;
    await db.collection('users').insertMany([validUser, inactiveUser]);
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  describe('Return status 200', () => {
    it('Should login success', async () => {
      const res = await request(server)
        .post('/v1/auth/sign-in')
        .send(_.pick(validUser, ['email', 'password']));

      expect(res.status).toBe(200);
      expect(res.body.data.token).toMatch(jwtTokenRegex);
    });

    it('Should login success with uppercase email', async () => {
      const res = await request(server).post('/v1/auth/sign-in').send({
        email: validUser.email.toUpperCase(),
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toMatch(jwtTokenRegex);
    });
  });

  describe('Return status 400', () => {
    it('Should return status 400 when empty body', async () => {
      const res = await request(server).post('/v1/auth/sign-in').send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        message: 'Bad Request',
        data: [
          {
            arg: 'email',
            reason: '"email" is not allowed to be empty',
          },
          {
            arg: 'email',
            reason: 'Invalid Email',
          },
          {
            arg: 'password',
            reason: '"password" is not allowed to be empty',
          },
        ],
      });
    });

    it('Should return status 400 when missing Email in body', async () => {
      const res = await request(server).post('/v1/auth/sign-in').send({
        password: 'random-string',
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        message: 'Bad Request',
        data: [
          {
            arg: 'email',
            reason: '"email" is not allowed to be empty',
          },
          {
            arg: 'email',
            reason: 'Invalid Email',
          },
        ],
      });
    });

    it('Should return status 400 when Email Wrong format', async () => {
      const res = await request(server).post('/v1/auth/sign-in').send({
        email: 'invalidEmail',
        password: 'random-string',
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        message: 'Bad Request',
        data: [
          {
            arg: 'email',
            reason: 'Invalid Email',
          },
        ],
      });
    });

    it('Should return status 400 when missing password in body', async () => {
      const res = await request(server).post('/v1/auth/sign-in').send({
        email: 'admin@email.com',
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        message: 'Bad Request',
        data: [
          {
            arg: 'password',
            reason: '"password" is not allowed to be empty',
          },
        ],
      });
    });
  });

  describe('Return status 401', () => {
    it('Should return status 401 when email is not exist', async () => {
      const res = await request(server).post('/v1/auth/sign-in').send({
        email: 'not.exist@email.com',
        password: '12345',
      });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        message: 'Email is not exist.',
      });
    });

    it('Should return status 401 when wrong password', async () => {
      const res = await request(server).post('/v1/auth/sign-in').send({
        email: validUser.email,
        password: 'wrong one',
      });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        message: 'Password incorrect.',
      });
    });
  });

  describe('Return status 403', () => {
    it('Should login success', async () => {
      const res = await request(server)
        .post('/v1/auth/sign-in')
        .send(_.pick(validUser, ['email', 'password']));

      expect(res.status).toBe(200);
      expect(res.body.data.token).toMatch(jwtTokenRegex);
    });
  });
});
