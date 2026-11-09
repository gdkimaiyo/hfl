import { orderBy } from "lodash";

import facilityService from "./facility.service";
import ResponseHelper from "../../helpers/response.helper";

/**
 * FacilityController.
 */
class FacilityController {
  /**
   * Get all facilities with pagination support
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   * @returns {Object} JSON response with paginated facilities metadata and data.
   */
  static async getFacilities(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const search = (req.query.search || "").trim().toLowerCase();
      const ownership = req.query.ownership || "both";
      const city = req.query.city || "All";
      const type = req.query.type || "";
      const skip = (page - 1) * limit;

      const allFacilities = await facilityService.getAll();
      const grandTotal = allFacilities ? allFacilities.length : 0;

      let filteredFacilities = allFacilities;

      if (filteredFacilities) {
        filteredFacilities = filteredFacilities.filter((f) => {
          const props = f.properties || {};

          const matchesOwnership =
            ownership === "both" ||
            (ownership === "private" && props.isPrivate === true) ||
            (ownership === "public" && props.isPrivate === false);

          const matchesType = !type || (props.type || "").toLowerCase() === type.toLowerCase();
          const matchesCity = city === "All" || (props.city || "").toLowerCase() === city.toLowerCase();

          let matchesSearch = true;
          if (search) {
            const name = (props.name || "").toLowerCase();
            const address = (props.address || "").toLowerCase();
            const fCity = (props.city || "").toLowerCase();
            const state = (props.state || "").toLowerCase();
            const fType = (props.type || "").toLowerCase();
            const postal = (props.postalCode || "").toString().toLowerCase();
            const ownText = props.isPrivate ? "private" : "public";

            matchesSearch =
              name.includes(search) ||
              address.includes(search) ||
              fCity.includes(search) ||
              state.includes(search) ||
              fType.includes(search) ||
              postal.includes(search) ||
              ownText.includes(search);
          }

          return matchesOwnership && matchesType && matchesCity && matchesSearch;
        });

        const facilitiesOrder = orderBy(filteredFacilities, ["created"], ["desc"]);
        const totalItems = facilitiesOrder.length;
        const paginatedItems = facilitiesOrder.slice(skip, skip + limit);

        return ResponseHelper.sendResponse(res, 200, "facilities fetched successfully", {
          data: paginatedItems,
          pagination: {
            currentPage: page,
            perPage: limit,
            totalItems, // Filtered count
            grandTotal, // Absolute database total
            totalPages: Math.ceil(totalItems / limit) || 1,
          },
        });
      }
    } catch (error) {
      console.log("Error", error);
      return ResponseHelper.sendResponse(res, 500, "Internal server error", null);
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
        return ResponseHelper.sendResponse(res, 200, "facility fetched successfully", facility);
      }
      return ResponseHelper.sendResponse(res, 404, "facility not found");
    } catch (error) {
      console.log("Error", error);
    }
  }

  /**
   * Gets suggested facilities by user location: [longitude, latitude].
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   */
  static async getSuggestedFacilities(req, res) {
    try {
      const { longitude, latitude } = req.query;

      const lng = longitude ? parseFloat(longitude) : null;
      const lat = latitude ? parseFloat(latitude) : null;

      // Service returns raw facilities array directly
      const facilities = await facilityService.getSuggestedFacilities(lng, lat, 5);

      return ResponseHelper.sendResponse(res, 200, "Suggested facilities fetched successfully", facilities);
    } catch (error) {
      console.error("Error fetching suggested facilities:", error);
      return ResponseHelper.sendError(res, 500, "Failed to fetch suggested facilities");
    }
  }

  /**
   * Gets facilities near the user using distance query.
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   */
  static async getFacilitiesNearMe(req, res) {
    try {
      const { distance, longitude, latitude } = req.query;

      const dist = distance ? parseFloat(distance) : 15;
      const lng = longitude ? parseFloat(longitude) : null;
      const lat = latitude ? parseFloat(latitude) : null;

      // Service returns raw facilities array directly
      const facilities = await facilityService.getFacilitiesNearMe(dist, lng, lat);

      return ResponseHelper.sendResponse(res, 200, "Facilities near me fetched successfully", facilities);
    } catch (error) {
      console.error("Error fetching facilities near me:", error);
      return ResponseHelper.sendError(res, 500, "Failed to fetch facilities near me");
    }
  }
}

export default FacilityController;
