/**
 * @class FormatData
 * @description Utility class for cleaning and formatting input data.
 */
export default class FormatData {
  /**
   * @static
   * @method trim
   * @description Recursively trims all string values in the provided object, including nested arrays and objects.
   * @param {object} newData - The data object to clean.
   * @returns {object} The cleaned data object with trimmed string values.
   */
  static trim(newData) {
    const cleaned = newData;

    Object.keys(cleaned).map((key) => {
      if (typeof cleaned[key] === 'string') {
        cleaned[key] = cleaned[key].trim();
      }
      if (cleaned[key] && typeof cleaned[key] === 'object' && cleaned[key].constructor === Array) {
        cleaned[key] = cleaned[key].map((item) => FormatData.trim(item));
      }
      if (cleaned[key] && typeof cleaned[key] === 'object' && cleaned[key].constructor === Object) {
        cleaned[key] = FormatData.trim(cleaned[key]);
      }
      return cleaned;
    });

    return cleaned;
  }
}
