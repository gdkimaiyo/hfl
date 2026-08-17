import axios from 'axios';
import { BACKEND_API } from '../secrets.config';

// Get all facilities
export const getFacilities = async () => {
  const response = await axios.get(`${BACKEND_API}/api/v1/facilities`);
  return response.data;
};
