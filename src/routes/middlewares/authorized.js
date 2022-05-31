import Cache from '~/clients/cache';
import Models from '~/models';
import Jwt from '~/wrappers/jwt';
import errorMessages from '../constants/error-messages';
import { unAuthorize } from '../utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 * @param {Jwt} deps.jwt
 * @param {Cache} deps.cache
 */
export default ({ cache, models, jwt }) => async (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');

  try {
    const { id } = await jwt.verify(token);
    const me = await models.User.findById(id);
    if (!me) {
      throw errorMessages.USER_NOT_FOUND;
    }

    req.context = {
      // tokenInfo: await jwt.verify(token),
      tokenInfo: {
        id: me._id.toHexString(),
        roles: (me.userGroup || {}).roles || [],
      },
      clientTimezone: req.headers.timezone || 'UTC',
    };
    const checkTokenInCache = await cache.getCache({ key: token });
    if (checkTokenInCache) return next();
    if (me && (me.validTokens || []).includes(token)) {
      await cache.setCache({ key: token, value: true });
      return next();
    }
  } catch (err) {
    return unAuthorize(res, 'Unauthorize');
  }

  return unAuthorize(res, 'Unauthorize');
};
