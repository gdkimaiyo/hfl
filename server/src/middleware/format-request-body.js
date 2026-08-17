import FormatData from '../helpers/format-data';

/**
 * Middleware to format and clean up incoming request bodies.
 */
export default class FormatRequestBody {
  /**
   * Trims all string fields in the request body.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  static trimInput(req, res, next) {
    if (req.body) {
      req.body = FormatData.trim(req.body);
    }
    return next();
  }
}
