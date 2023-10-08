class customError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const customApiError = (msg, statusCode) => {
  return new customError(msg, statusCode);
};

export default customApiError;
