import errorMessages from '~/routes/constants/error-messages';
import { unAuthorized } from '../helper/response';

export default ({ cache, jwt, models }) => async (socket, next) => {
  const { auth } = socket.handshake;
  const { authorization } = auth;

  const token = (authorization || '').replace('Bearer ', '');

  try {
    const { id } = await jwt.verify(token);
    const me = await models.User.findById(id);
    if (!me) {
      throw errorMessages.USER_NOT_FOUND;
    }

    socket.handshake.auth = {
      ...socket.handshake.auth,
      tokenInfo: {
        id: me._id.toHexString(),
        roles: (me.userGroup || {}).roles || [],
      },
    };

    const checkTokenInCache = await cache.getCache({ key: token });
    if (checkTokenInCache) return next();
    if (me && (me.validTokens || []).includes(token)) {
      await cache.setCache({ key: token, value: true });
      return next();
    }
  } catch (err) {
    return unAuthorized(next);
  }

  return unAuthorized(next);
};
