const {
  InvalidTokenError,
  UnauthorizedError,
} = require("express-oauth2-jwt-bearer");

const errorHandler = (error, request, response, next) => {

  if (error instanceof InvalidTokenError) {
    const message = "Bad credentials";

    response.status(error.status).json({ message });

    return;
  }

  if (error instanceof UnauthorizedError) {
    const message = "Requires authentication";

    response.status(error.status).json({ message });

    return;
  }

  if (error.code && error.message) {
    const statusCode = error.httpCode || 400;
    return response.status(statusCode).send({ code: error.code, message: error.message,  });
  }

  const status = 500;
  const message = "Internal Server Error";

  response.status(status).json({ message });
};

module.exports = {
  errorHandler,
};