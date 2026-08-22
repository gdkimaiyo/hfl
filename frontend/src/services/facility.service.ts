import axios from "axios";
import { BACKEND_API } from "../secrets.config";
import type { Coordinates } from "../types/user.types";

// Get all facilities
export const getAllFacilities = async () => {
  const response = await axios.get(`${BACKEND_API}/api/v1/facilities`);
  return response.data;
};

// // Get suggested facilities
// // Facilities that are in close proximity to the current visitor/user
// // If userLocation is null, the API returns ONLY top facilities in Kenya
export const getSuggestedFacilities = async (userLocation: Coordinates | null) => {
  const params: Record<string, number> = {};

  if (userLocation) {
    params.longitude = userLocation[0];
    params.latitude = userLocation[1];
  }

  const response = await axios.get(`${BACKEND_API}/api/v1/facilities/suggested`, { params });
  return response.data;
};
