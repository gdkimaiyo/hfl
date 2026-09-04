import distance from "@turf/distance";
import { point } from "@turf/helpers";
import { Facility } from "../../db";

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

  /**
   * Get suggested facilities and calculate dynamic distance if user coordinates are provided.
   * Falls back to default top suggested facilities in Kenya if coords are omitted.
   * @param {number|null} lng - Longitude coordinate
   * @param {number|null} lat - Latitude coordinate
   * @param {number} limit - Maximum number of facilities to return
   * @returns {Promise<Array<Object>>}
   */
  async getSuggestedFacilities(lng = null, lat = null, limit = 5) {
    let facilities = [];

    // Location Available: Query nearest facilities via MongoDB Geospatial Indexing
    const hasCoordinates = lng !== null && lat !== null && !isNaN(lng) && !isNaN(lat);
    if (hasCoordinates) {
      // Fetch nearest facilities sorted by proximity via MongoDB 2DSphere index
      facilities = await Facility.find({
        geometry: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        },
      })
        .limit(limit)
        .lean() // Use .lean() to convert Mongoose documents to plain JavaScript to allow attaching properties easily
        .exec();

      // Calculate distance in km for each facility and assign to properties.distance
      const userPoint = point([lng, lat]);

      facilities = facilities.map((facility) => {
        const facilityCoords = facility.geometry?.coordinates;
        if (facilityCoords) {
          const facilityPoint = point(facilityCoords);
          const distInKm = distance(userPoint, facilityPoint, { units: "kilometers" });

          // Round to 2 decimal places (e.g., 2.45 km)
          facility.properties.distance = Math.round(distInKm * 100) / 100;
          // Round to 1 decimal place (e.g. 2.4 km)
          // facility.properties.distance = Math.round(distInKm * 10) / 10;
        }
        return facility;
      });

      return facilities;
    }

    // Location Missing/Disabled: Fallback to featured/suggested facilities
    const suggested = await Facility.find({ "properties.isSuggested": true }).limit(limit).exec();

    // If fewer than limit found with isSuggested, fallback to top database entries
    if (suggested.length > 0) return suggested;

    return await Facility.find({}).limit(limit).exec();
  }

  /**
   * Get facilities within a given radius (default 15 km) of the user,
   * or fallback to top suggested facilities if location is disabled/missing.
   *
   * @param {number|null} dist - Radius distance in km (defaults to 15)
   * @param {number|null} lng - User longitude
   * @param {number|null} lat - User latitude
   * @returns {Promise<Array<Object>>}
   */
  async getFacilitiesNearMe(dist, lng = null, lat = null) {
    const hasCoordinates = lng !== null && lat !== null && !isNaN(lng) && !isNaN(lat);

    if (hasCoordinates) {
      // Convert km radius to meters for MongoDB $maxDistance (default 15 km -> 15000 meters)
      const maxDistanceInMeters = dist * 1000;

      // Query facilities within maxDistance using 2DSphere index
      let facilities = await Facility.find({
        geometry: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: maxDistanceInMeters,
          },
        },
      })
        .lean()
        .exec();

      // Compute exact distance in km for each facility
      const userPoint = point([lng, lat]);

      facilities = facilities.map((facility) => {
        const facilityCoords = facility.geometry?.coordinates;
        if (facilityCoords) {
          const facilityPoint = point(facilityCoords);
          const distInKm = distance(userPoint, facilityPoint, { units: "kilometers" });

          // Assign rounded distance (e.g., 3.42 km)
          facility.properties.distance = Math.round(distInKm * 100) / 100;
        }
        return facility;
      });

      // TODO : Implement pagination
      return facilities;
    }

    // Fallback when user location is missing/disabled: Return top suggested facilities
    const suggested = await Facility.find({ "properties.isSuggested": true }).lean().exec();

    // TODO : Implement pagination

    if (suggested.length > 0) return suggested;

    // Default fallback if no facilities have isSuggested: true
    return await Facility.find({}).lean().exec();
  }
}

const facilityService = new FacilityService();

export default facilityService;
