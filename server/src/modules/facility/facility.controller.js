import { orderBy } from 'lodash';

import facilityService from './facility.service';
import ResponseHelper from '../../helpers/response.helper';

/**
 * FacilityController.
 */
class FacilityController {
  /**
   * Get all facilities
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   * @returns {Object} JSON response with the facilities data or error.
   */
  static async getFacilities(req, res) {
    try {
      const facilities = await facilityService.getAll();

      if (facilities) {
        const facilitiesOrder = orderBy(facilities, ['created'], ['desc']);
        return ResponseHelper.sendResponse(res, 200, 'facilities fetched successfully', facilitiesOrder);
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  /**
   * Retrieves a facility by ID.
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   * @returns {Object} JSON response with the facility data or error.
   */
  static async getFacility(req, res) {
    const { id } = req.params;

    try {
      const facility = await facilityService.getOne(id);
      if (facility) {
        return ResponseHelper.sendResponse(res, 200, 'facility fetched successfully', facility);
      }
      return ResponseHelper.sendResponse(res, 404, 'facility not found');
    } catch (error) {
      console.log('Error', error);
    }
  }
}

export default FacilityController;
