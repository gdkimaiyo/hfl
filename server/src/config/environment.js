import "../load-env";

/**
 * Centralized environment configuration object.
 * Loads variables from process.env and applies defaults where needed.
 * @typedef {Object} Environment
 */

/**
 * Environment variables with defaults applied where appropriate.
 * @type {Environment}
 */
const environment = {
  ...process.env,
  PORT: process.env.PORT || 5002,
  NODE_ENV: process.env.NODE_ENV || "production",
  REDIS_URL: process.env.REDIS_URL,
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,

  APP_DOMAIN: process.env.APP_DOMAIN,
};

// Add derived property for easier checks throughout the app
Object.assign(environment, {
  isDevelopment: environment.NODE_ENV === "development" || environment.NODE_ENV === "dev",
});

export default environment;
