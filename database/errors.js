/**
 * CustomError - Base class for custom errors with advanced features.
 * Supports error chaining, metadata, and serialization.
 */
class CustomError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Object} [options]
   * @param {Error} [options.cause] - Underlying cause of the error
   * @param {any} [options.details] - Additional error details
   * @param {number} [options.code] - Optional error code
   * @param {string} [options.hint] - Optional hint for debugging
   */
  constructor(message, { cause, details, code, hint } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    this.cause = cause;
    this.code = code;
    this.hint = hint;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes the error to a plain object, including nested causes.
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      hint: this.hint,
      details: this.details,
      cause: this.cause && typeof this.cause.toJSON === "function"
        ? this.cause.toJSON()
        : this.cause
          ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
          : undefined,
      stack: this.stack,
    };
  }

  /**
   * Returns a string representation of the error, including causes.
   * @returns {string}
   */
  toString() {
    let str = `${this.name}: ${this.message}`;
    if (this.code) str += ` (code: ${this.code})`;
    if (this.hint) str += `\nHint: ${this.hint}`;
    if (this.details) str += `\nDetails: ${JSON.stringify(this.details)}`;
    if (this.cause) {
      str += `\nCaused by: ${this.cause.toString ? this.cause.toString() : this.cause}`;
    }
    return str;
  }
}

/**
 * DatabaseError - Represents errors related to database operations.
 */
class DatabaseError extends CustomError {
  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {Error} [options.cause]
   * @param {any} [options.details]
   * @param {number} [options.code]
   * @param {string} [options.hint]
   * @param {string} [options.query] - The SQL query or operation that failed
   */
  constructor(message, { cause, details, code, hint, query } = {}) {
    super(message, { cause, details, code, hint });
    this.query = query;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      query: this.query,
    };
  }

  toString() {
    let str = super.toString();
    if (this.query) str += `\nQuery: ${this.query}`;
    return str;
  }
}

/**
 * CacheError - Represents errors related to cache operations.
 */
class CacheError extends CustomError {
  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {Error} [options.cause]
   * @param {any} [options.details]
   * @param {number} [options.code]
   * @param {string} [options.hint]
   * @param {string} [options.key] - The cache key involved in the error
   */
  constructor(message, { cause, details, code, hint, key } = {}) {
    super(message, { cause, details, code, hint });
    this.key = key;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      key: this.key,
    };
  }

  toString() {
    let str = super.toString();
    if (this.key) str += `\nCache Key: ${this.key}`;
    return str;
  }
}

/**
 * ValidationError - Represents errors related to validation.
 */
class ValidationError extends CustomError {
  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {Error} [options.cause]
   * @param {any} [options.details]
   * @param {number} [options.code]
   * @param {string} [options.hint]
   * @param {string[]} [options.fields] - Fields that failed validation
   */
  constructor(message, { cause, details, code, hint, fields } = {}) {
    super(message, { cause, details, code, hint });
    this.fields = fields;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      fields: this.fields,
    };
  }

  toString() {
    let str = super.toString();
    if (this.fields) str += `\nInvalid Fields: ${this.fields.join(", ")}`;
    return str;
  }
}

/**
 * NotFoundError - Represents errors when a resource is not found.
 */
class NotFoundError extends CustomError {
  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {Error} [options.cause]
   * @param {any} [options.details]
   * @param {number} [options.code]
   * @param {string} [options.hint]
   * @param {string} [options.resource] - The resource that was not found
   */
  constructor(message, { cause, details, code, hint, resource } = {}) {
    super(message, { cause, details, code, hint });
    this.resource = resource;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      resource: this.resource,
    };
  }

  toString() {
    let str = super.toString();
    if (this.resource) str += `\nResource: ${this.resource}`;
    return str;
  }
}

module.exports = {
  CustomError,
  DatabaseError,
  CacheError,
  ValidationError,
  NotFoundError,
};
