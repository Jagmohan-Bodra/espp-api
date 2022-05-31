import { notFound } from '../helper/response';

export default ({ models }) => async (socket, next) => {
  let { auth } = socket.handshake;
  const { headers } = socket.handshake;

  if (!auth) {
    // Logic to support Socket.io V2
    auth = { ...headers };
    socket.handshake.auth = { ...auth };
  }

  const { authorization, timezone } = auth;

  try {
    socket.handshake.auth = {
      authorization,
      models,
      clientTimezone: timezone || '+00:00',
    };
  } catch (err) {
    return notFound(next);
  }

  return next();
};
