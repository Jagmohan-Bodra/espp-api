import errorMessages from '../constants/error-messages';
import { badRequest } from '../utils/response';

const request = require('request');

const postClient = (url, { headers, body, form }) =>
  new Promise((resolve, reject) =>
    request(
      {
        method: 'POST',
        url,
        form,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body,
        json: true,
      },
      (err, res, results) => {
        if (err) {
          console.log('recaptcha-err: ', err);
          return reject(err);
        }
        return resolve(results);
      },
    ),
  );

export default ({ config }) => async (req, res, next) => {
  const { RE_CAPTCHA_SECRET_KEY, RE_CAPTCHA_URL } = config;
  const recaptra = req.headers.recaptra || '';
  const results = await postClient(RE_CAPTCHA_URL, {
    form: {
      secret: RE_CAPTCHA_SECRET_KEY,
      response: recaptra,
    },
  }).catch(() => ({ success: false }));

  if (!(results || {}).success) {
    return badRequest(res, errorMessages.RECAPTRA_ERR);
  }

  return next();
};
