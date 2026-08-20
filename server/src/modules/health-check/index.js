import express from "express";
import HealthController from "./health-check.controller";

const healthCheckRouter = express.Router();

/**
 * @swagger
 * /health:
 *  get:
 *    summary: Get up status of application
 *    tags:
 *      - Health Checks
 *    responses:
 *      200:
 *        description: application is up and running
 */
healthCheckRouter.get("/", HealthController.getStatus);

export default healthCheckRouter;
