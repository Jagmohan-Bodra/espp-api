import errorMessages from '../constants/error-messages';
import { forbidden } from '../utils/response';

export default (role) => (req, res, next) => {
  const { roles } = req.context.tokenInfo;

  const passPermission = roles.find((item) => item === role);

  if (!passPermission) {
    return forbidden(res, errorMessages.PERMISSION_DENY);
  }

  return next();
};
