export const successResponse = (res, data = {}, meta) => {
  res.status(200).send({ data, meta });
};

export const unAuthorize = (res, message) => {
  res.status(401).send({ message });
};

export const badRequestFormatter = (fieldName, message) => ({
  arg: fieldName,
  reason: message,
});

export const badRequest = (res, data) => {
  res.status(400).send({
    message: 'Bad Request',
    data,
  });
};

export const forbidden = (res, message = 'forbidden') => {
  res.status(403).send({ message });
};

export const notFound = (res, message = 'Not Found') => {
  res.status(404).send({ message });
};

export const serverError = (res, error) => {
  res.status(500).send({
    message: 'Server Errors.',
    data: error,
  });
};

export const validateResponse = (res, message = 'Not Found', data = []) => {
  res.status(422).send({ message, data });
};

export const errorResponseHandler = (res, error) => {
  if (error.code === 401) {
    return unAuthorize(res, error.message);
  }

  if (error.code === 403) {
    return forbidden(res, error.message);
  }

  if (error.code === 404) {
    return notFound(res, error.message);
  }

  if (error.code === 422) {
    return validateResponse(res, error.message, error.data);
  }

  if (error.code === 400 && error.field) {
    return badRequest(res, badRequestFormatter(error.field, error.message));
  }

  if (error.code === 400) {
    return badRequest(res, error.message);
  }

  return serverError(res, error);
};
