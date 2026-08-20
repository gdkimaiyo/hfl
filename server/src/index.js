import debug from "debug";

import environment from "./config/environment";
import app, { server } from "./app";
import { initializeDB } from "./db";
import startUpHelper from "./scripts/startup-helper";

/**
 * Logger instance using the `debug` package.
 * Namespaced as 'log' for consistent debugging.
 * @type {debug.Debugger}
 */
const logger = debug("log");

// Register global event handlers (e.g., unhandledRejection, SIGINT)
startUpHelper.registerEventHandlers();

/**
 * Starts the Express server and initializes supporting services like
 * the MongoDB database connection.
 */
server.listen(environment.PORT, async () => {
  app.set("host", `http://localhost:${environment.PORT}`);
  logger(`HFL API service is running on http://localhost:${environment.PORT}`);
  initializeDB(logger);
  // await bootService.scheduleJobs();
});
