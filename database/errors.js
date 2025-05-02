class CustomError extends Error {
  constructor(message, { cause, details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}

class DatabaseError extends CustomError {}
class CacheError extends CustomError {}

module.exports = {
  DatabaseError,
  CacheError,
  CustomError,
};
