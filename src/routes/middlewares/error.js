import { serverError } from '../utils/response';

export default (err, req, res, next) => {
  // TODO: Log the error to an log system
  console.log('Request:', req.body);
  console.log('Error:', err);

  serverError(res, err);
  next(err);
};
