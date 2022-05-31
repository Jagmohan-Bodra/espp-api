import { validationResult } from 'express-validator';

import { badRequest, badRequestFormatter } from '../utils/response';

export default (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const data = errors
    .array()
    .map((err) => badRequestFormatter(err.param, err.msg));

  return badRequest(res, data);
};
