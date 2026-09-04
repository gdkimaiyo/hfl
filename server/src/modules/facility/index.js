import express from "express";
import FacilityController from "./facility.controller";

const facilityRouter = express.Router();

/**
 * Retrieves a list of facilities
 * @route GET /api/v1/facilities
 * @returns {Object} 200 - Facilities object
 * @returns {Object} 404 - Facilities not found
 */
facilityRouter.get("/facilities", FacilityController.getFacilities);

/**
 * Retrieves a list of suggested facilities based on user proximity or defaults
 * @route GET /api/v1/facilities/suggested
 * @query {number} [longitude] - User's longitude
 * @query {number} [latitude] - User's latitude
 * @returns {Object} 200 - Suggested facilities object
 */
facilityRouter.get("/facilities/suggested", FacilityController.getSuggestedFacilities);

/**
 * Retrieves a list of facilities in proximity to the user or defaults
 * @route GET /api/v1/facilities/near-me
 * @query {number} [distance] - facilities distance radius
 * @query {number} [longitude] - User's longitude
 * @query {number} [latitude] - User's latitude
 * @returns {Object} 200 - Facilities near me object
 */
facilityRouter.get("/facilities/near-me", FacilityController.getFacilitiesNearMe);

/**
 * Retrieves a facility by their ID.
 * @route GET /api/v1/facilities/:id
 * @param {string} req.params.id - The ID of the facility to retrieve.
 * @returns {Object} 200 - Facility object
 * @returns {Object} 404 - Facility not found
 */
facilityRouter.get("/facilities/:id", FacilityController.getFacility);

export default facilityRouter;
