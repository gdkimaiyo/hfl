import dotenv from 'dotenv-extended';
import { resolve } from 'path';

/**
 * Get the current environment (e.g., 'development', 'production', 'test').
 * Defaults to an empty string if not set.
 * @type {string}
 */
const envName = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : '';

/**
 * Boolean indicating if the current environment is 'test'.
 * @type {boolean}
 */
const isTest = envName === 'test';

/**
 * Resolve the path to the specific environment file (e.g., `.env.production`).
 * @type {string}
 */
const path = resolve(__dirname, `../.env.${envName}`);

/**
 * Load environment variables using dotenv-extended.
 * Supports fallback defaults, schema validation, and customizable error handling.
 */
dotenv.load({
  silent: true, // Suppress errors if .env files are missing (useful in CI/CD)
  path, // Path to the environment-specific .env file
  defaults: resolve(__dirname, '../.env'), // Default .env values
  schema: resolve(__dirname, '../.env.sample'), // Validates required variables
  errorOnMissing: !isTest, // Allow missing vars only in test environment
  errorOnExtra: false, // Ignore extra variables
  errorOnRegex: false, // Skip regex validation
  includeProcessEnv: true, // Include already-set env vars
  overrideProcessEnv: true, // Override existing env vars with values from files
});
