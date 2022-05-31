import jwt from 'jsonwebtoken';

export default class Jwt {
  constructor(jwtSecret) {
    this.jwtSecret = jwtSecret;
  }

  sign(obj, opt = { expiresIn: '9999 years' }) {
    return jwt.sign(obj, this.jwtSecret, opt);
  }

  verify(str) {
    return new Promise((resolve, reject) => {
      jwt.verify(str, this.jwtSecret, (err, decode) => {
        if (err) {
          return reject(err);
        }
        return resolve(decode);
      });
    });
  }
}
