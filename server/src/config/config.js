import environment from "./environment";

const config = {
  CORS_ALLOW_CREDENTIALS: true,
  CORS_ORIGIN_ALLOW_ALL: true,
  CORS_ALLOWED_ORIGINS: ["http://localhost:9000"],
};

if (environment.NODE_ENV === "production" || environment.NODE_ENV === "staging") {
  config.CORS_ORIGIN_ALLOW_ALL = false;
  config.CORS_ALLOWED_ORIGINS = environment.CORS_ALLOWED_ORIGINS.split(",");
}

export default config;
