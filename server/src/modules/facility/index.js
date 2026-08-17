import express from 'express';
import FacilityController from './facility.controller';

const facilityRouter = express.Router();

/**
 * Retrieves a list of facilities
 * @route GET /api/v1/facilities
 * @returns {Object} 200 - Facilities object
 * @returns {Object} 404 - Facilities not found
 */
facilityRouter.get('/facilities', FacilityController.getFacilities);

/**
 * Retrieves a facility by their ID.
 * @route GET /api/v1/facilities/:id
 * @param {string} req.params.id - The ID of the facility to retrieve.
 * @returns {Object} 200 - Facility object
 * @returns {Object} 404 - Facility not found
 */
facilityRouter.get('/facilities/:id', FacilityController.getFacility);

export default facilityRouter;
