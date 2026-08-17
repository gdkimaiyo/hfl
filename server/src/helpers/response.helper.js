/**
 * ResponseHelper is a utility class for sending standardized HTTP JSON responses.
 */
export default class ResponseHelper {
  /**
   * Sends a JSON response with a given status code, message, and optional data.
   *
   * @param {Object} res - Express response object.
   * @param {number} code - HTTP status code.
   * @param {string} message - Response message.
   * @param {*} [data] - Optional data to include in the response.
   * @returns {Object} - The Express response object.
   */
  static sendResponse(res, code, message, data) {
    return res.status(code).json({
      message,
      data,
    });
  }
}
