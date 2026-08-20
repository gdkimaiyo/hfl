import facilityRouter from "./facility";
import healthCheckRouter from "./health-check";

const apiPrefix = "/api/v1";

/**
 * Registers application routes with their respective routers.
 *
 * @param {import('express').Application} app - The Express application instance.
 * @returns {import('express').Application} The Express app with routes configured.
 */
const routes = (app) => {
  app.use(apiPrefix, facilityRouter);
  app.use("/health", healthCheckRouter);

  return app;
};

export default routes;
