import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import morgan from "morgan";
import bodyParser from "body-parser";
import modules from "./modules";
import hbsConfig from "./hbs-config";
import config from "./config/config";

const app = express();

/**
 * HTTP server instance created using Express app.
 * @type {http.Server}
 */
export const server = http.createServer(app);

// Use morgan for logging requests in non-test environments
if (app.get("env") !== "test") {
  app.use(morgan("dev"));
}

// CORS configuration
const corsOptions = {
  credentials: config.CORS_ALLOW_CREDENTIALS,
  origin: config.CORS_ALLOWED_ORIGINS,
};

/**
 * Middleware to enable Cross-Origin Resource Sharing (CORS) with specific options.
 */
app.use(cors(corsOptions));

/**
 * Middleware to parse incoming request bodies with URL-encoded data.
 * Only supports simple key/value pairs (not nested objects).
 */
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

/**
 * Middleware to parse incoming request bodies with JSON payloads.
 */
app.use(bodyParser.json());

/**
 * @description Serves static assets from the "assets" directory.
 * Requests to "/assets" will serve files from the local "assets" folder.
 */
app.use("/assets", express.static(path.join(__dirname, "assets")));
/**
 * @description Sets the directory where the application's view templates are stored.
 */
app.set("views", path.join(__dirname, "views"));

/**
 * @description Configures and initializes the handlebars view engine.
 * @param {Express.Application} app - The Express application instance.
 * @returns {Object} hbs - The configured handlebars engine.
 */
export const hbs = hbsConfig(app);
/**
 * @description Registers the handlebars engine to render ".html" files.
 */
app.engine("html", hbs.engine);

/**
 * @description Sets the default view engine to "html" using the configured handlebars engine.
 */
app.set("view engine", "html");

/**
 * @description Sets up API route modules and middleware.
 * @param {Express.Application} app - The Express application instance.
 */
modules(app);

/**
 * The configured Express application instance.
 * Use this to define routes and middlewares.
 *
 * @type {express.Application}
 */
export default app;
