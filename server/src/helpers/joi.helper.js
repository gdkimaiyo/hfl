/**
 * JoiHelper is a utility class for validating data against Joi schemas
 * and formatting Joi validation errors into user-friendly messages.
 */
export default class JoiHelper {
  /**
   * Validates a submission object against a Joi schema.
   *
   * @param {Object} submission - The object to validate.
   * @param {Object} schema - A Joi schema used for validation.
   * @returns {Object} - The validated object if valid, or a formatted error object if invalid.
   */
  static validateSubmission(submission, schema) {
    const { error, value } = schema.validate(submission, {
      abortEarly: false,
      convert: true,
    });
    if (error) {
      return JoiHelper.handleError(error.details);
    }
    return value;
  }

  /**
   * Converts Joi validation errors into a friendly error message object.
   *
   * @param {Array} errorDetails - Array of Joi error detail objects.
   * @returns {Object} - An object containing field-specific error messages and a general error message.
   */
  static handleError(errorDetails) {
    const errorObject = {
      errorMessage: "validation error(s) detected",
    };
    errorDetails.forEach(({ message, type, context, context: { label } }) => {
      switch (type) {
        case "any.required":
          errorObject[`${label}`] = `Please provide ${label}`;
          break;
        case "any.allowOnly":
          errorObject[`${label}`] = `only ${context.valids} are allowed`;
          break;
        case "number.base":
          errorObject[`${label}`] = `${label} should be a number`;
          break;
        case "number.min":
          errorObject[`${label}`] = `${label} should not be less than ${context.limit}`;
          break;
        case "number.max":
          errorObject[`${label}`] = `${label} should not be greater than ${context.limit}`;
          break;
        case "string.email":
          errorObject[`${label}`] = "please provide a valid email address";
          break;
        case "string.regex.base":
          errorObject[`${label}`] = `please provide a valid ${label}`;
          break;
        default:
          errorObject[`${label}`] = `${message}`;
      }
    });
    return errorObject;
  }
}
