const API =
  process.env.NODE_ENV === "production"
    ? process.env.VUE_APP_BACKEND_API
    : "http://localhost:3081";

export const BACKEND_API = API;

const TOKEN =
  process.env.NODE_ENV === "production" ? process.env.VUE_APP_MAPBOX_TOKEN : "";

export const MAPBOX_TOKEN = TOKEN;
