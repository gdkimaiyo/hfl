import axios from "axios";
import type { UserLocationData } from "../types/location.types";

// export const getLocation = async () => {
//   const response = await axios.get("https://api.db-ip.com/v2/free/self");
//   return response.data;
// };

const STORAGE_KEY = "hfl_user_ip_location";
const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days cache

export const getCachedLocation = (): UserLocationData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed.timestamp || !parsed.data) return null;

    // Check if cache has expired
    if (Date.now() - parsed.timestamp > EXPIRATION_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.data as UserLocationData;
  } catch (err) {
    console.warn("Failed to read location from localStorage", err);
    return null;
  }
};

// Saves location data to localStorage with a timestamp.
export const setCachedLocation = (data: UserLocationData): void => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    );
  } catch (err) {
    console.warn("Failed to save location to localStorage", err);
  }
};

// Fetch IP Geolocation with fallback handling.
export const fetchUserLocationByIP = async (): Promise<UserLocationData> => {
  // Check persistent localStorage cache first
  const cached = getCachedLocation();
  if (cached) return cached;

  // Primary Provider: ipapi.co
  try {
    const fallbackResponse = await axios.get("https://ipapi.co/json/", {
      timeout: 5000,
    });

    const fallbackData: UserLocationData = {
      ipAddress: fallbackResponse.data.ip,
      city: fallbackResponse.data.city,
      stateProv: fallbackResponse.data.region,
      countryCode: fallbackResponse.data.country_code,
      countryName: fallbackResponse.data.country_name,
      latitude: fallbackResponse.data.latitude,
      longitude: fallbackResponse.data.longitude,
    };

    setCachedLocation(fallbackData);
    return fallbackData;
  } catch (error) {
    console.warn("Primary IP service (ipapi.co) failed, trying fallback...", error);
  }

  // Fallback Provider: db-ip
  try {
    const response = await axios.get("https://api.db-ip.com/v2/free/self", {
      timeout: 5000,
    });

    const data: UserLocationData = {
      ipAddress: response.data.ipAddress,
      city: response.data.city,
      stateProv: response.data.stateProv,
      countryCode: response.data.countryCode,
      countryName: response.data.countryName,
    };

    setCachedLocation(data);
    return data;
  } catch (fallbackError) {
    console.warn("All IP geolocation providers failed", fallbackError);
    throw new Error("Unable to resolve location from IP.");
  }
};
