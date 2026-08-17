import { Facility } from '../../db';

class FacilityService {
  /**
   * Get all facilities from the database.
   * @returns {Promise<Array<Object>>} Array of facility objects.
   */
  async getAll() {
    const data = await Facility.find({}).exec();
    return data;
  }

  /**
   * Get a single facility by ID.
   * @param {string} facilityId - The ID of the facility.
   * @returns {Promise<Object|null>} Facility object or null if not found.
   */
  async getOne(facilityId) {
    const data = await Facility.findOne({ _id: facilityId }).exec();
    return data;
  }

  /**
   * Add a new facility to the database.
   * @param {Object} data - The facility data.
   * @returns {Promise<Object>} The created facility object.
   */
  async addFacility(data) {
    const facility = new Facility({ ...data });
    const result = await facility.save();
    return result;
  }
}

const facilityService = new FacilityService();

export default facilityService;
