export type FacilityFeature = {
  _id: string;
  type: "Feature";
  name: string;
  geometry: {
    point: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: Property;
  created?: string;
  updated?: string;
};

export type Property = {
  id?: number;
  name: string;
  address: string;
  city: string;
  country: string;
  state: string;
  type: string;
  level: number;
  isPrivate: boolean;
  isSuggested: boolean;
  phone?: string;
  email?: string;
  mailingAddress?: string;
  postalCode?: string;
  distance?: number;
  image?: string;
};

export type FacilityGeoJSON = {
  type: "FeatureCollection";
  features: FacilityFeature[];
};

export type Distance = {
  id: string;
  radius: number;
};
