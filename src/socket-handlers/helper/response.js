export const throwErr = (cb = () => {}, message = 'Bad request', data) =>
  cb({
    isErr: true,
    message,
    data,
  });

export const successRes = (cb = () => {}, data) =>
  cb({
    isErr: false,
    data,
  });

export const badRequest = (next) => {
  const err = new Error('bad request');
  err.data = { content: 'Please retry later' };
  return next(err);
};

export const notFound = (next) => {
  const err = new Error('not found');
  err.data = { content: 'Please retry later' };
  return next(err);
};

export const unAuthorized = (next) => {
  const err = new Error('not authorized');
  err.data = { content: 'Please retry later' };
  return next(err);
};
