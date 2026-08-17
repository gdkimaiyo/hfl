/**
 * @class HttpError
 * @extends Error
 * @description Custom error class for handling HTTP errors with optional status codes and additional error info.
 */
class HttpError extends Error {
  /**
   * @constructor
   * @param {string} message - The error message.
   * @param {number} [code=500] - The HTTP status code.
   * @param {any} [error] - Optional additional error details.
   */
  constructor(message, code = 500, error) {
    super();
    this.message = message;
    this.statusCode = code;
    this.error = error;
  }

  /**
   * @static
   * @method throwErrorIfNull
   * @description Throws an HttpError if the given data is null or undefined.
   * @param {any} data - The data to check.
   * @param {string} message - Error message if data is null.
   * @param {number} [code=404] - HTTP status code to use if throwing the error.
   * @throws {HttpError}
   */
  static throwErrorIfNull(data, message, code = 404) {
    if (!data) {
      throw new HttpError(message, code);
    }
  }

  /**
   * @static
   * @method sendErrorResponse
   * @description Sends a formatted error response to the client.
   * @param {HttpError} errorInstance - The error instance to send.
   * @param {import('express').Response} res - The Express response object.
   * @returns {import('express').Response} JSON error response.
   */
  static sendErrorResponse(errorInstance, res) {
    const code = errorInstance.statusCode || 500;
    const { message, error } = errorInstance;
    return res.status(code).json({
      success: false,
      message,
      error,
    });
  }
}

export default HttpError;
