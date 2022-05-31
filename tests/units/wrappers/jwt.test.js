import jwt, { decode } from 'jsonwebtoken';
import wrapper from '~/wrappers/jwt';

const jwtSecret = 'jwtSecret';
const signObj = { key: 'val' };
const opts = { opts: 'val' };
const fakeToken = 'fakeToken';

describe('Test Wrapper JsonWebToken', () => {
  describe('jwt.sign', () => {
    it('Should call jsonwebtoken.sign with correct param', () => {
      jwt.sign = jest.fn().mockReturnValue(fakeToken);
      const res = new wrapper(jwtSecret).sign(signObj, opts);

      expect(jwt.sign.mock.calls[0][0]).toMatchObject(signObj);
      expect(jwt.sign.mock.calls[0][1]).toBe(jwtSecret);
      expect(jwt.sign.mock.calls[0][2]).toMatchObject(opts);

      expect(res).toBe(fakeToken);
    });
  });

  describe('jwt.verify', () => {
    it('Should call jsonwebtoken.verify without any error', async () => {
      const err = null;
      const decode = signObj;

      jwt.verify = jest.fn((str, secret, callback) => {
        expect(str).toBe(fakeToken);
        expect(secret).toBe(jwtSecret);
        callback(err, decode);
      });

      const res = await new wrapper(jwtSecret).verify(fakeToken);
      expect(res).toMatchObject(signObj);
    });

    it('Should call jsonwebtoken.verify and received an error', async () => {
      const err = 'not null';
      const decode = signObj;

      jwt.verify = jest.fn((str, secret, callback) => {
        expect(str).toBe(fakeToken);
        expect(secret).toBe(jwtSecret);
        callback(err, decode);
      });

      await expect(new wrapper(jwtSecret).verify(fakeToken)).rejects.toBe(
        'not null',
      );
    });
  });
});
