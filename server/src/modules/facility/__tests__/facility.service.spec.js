import mongoose from "mongoose";
import facilityService from "../facility.service"; // Adjust path as needed
import mockdb from "../../../test-db";
import { Facility as facilityModel } from "../../../db";

import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";

const facilityComplete = {
  name: "General Hospital",
  type: "Feature",
  geometry: {
    coordinates: [36.8219, -1.2921], // Longitude, Latitude
  },
  properties: {
    name: "General Hospital",
    address: "123 Health St",
    city: "Nairobi",
    country: "Kenya",
    state: "Nairobi County",
    // type and level will use defaults
  },
};

const facilityMissingGeometry = {
  name: "Incomplete Facility",
  properties: {
    name: "No Map Data",
    address: "123 Health St",
    city: "Nairobi",
    country: "Kenya",
    state: "Nairobi County",
  },
};

const facilityMissingRequiredProps = {
  name: "Missing Address Facility",
  geometry: {
    coordinates: [36.8219, -1.2921],
  },
  properties: {
    name: "Missing Address",
    city: "Nairobi",
    country: "Kenya",
    state: "Nairobi County",
    // address is missing
  },
};

describe("Facility Service", () => {
  beforeAll(async () => {
    await mockdb.connect();
  });

  afterEach(async () => {
    await mockdb.clearDatabase();
  });

  afterAll(async () => {
    await mockdb.closeDatabase();
  });

  describe("Add Facility", () => {
    it("can be created correctly with nested objects", async () => {
      expect(async () => {
        await facilityService.addFacility(facilityComplete);
      }).not.toThrow();
    });

    it("applies default values for point, type, and level", async () => {
      await facilityService.addFacility(facilityComplete);
      const saved = await facilityModel.findOne({ name: "General Hospital" });

      expect(saved.geometry.point).toBe("Point"); // Default from geometrySchema
      expect(saved.properties.type).toBe("Hospital"); // Default from propertiesSchema
      expect(saved.properties.level).toBe(2);
    });

    it("exists after being created", async () => {
      await facilityService.addFacility(facilityComplete);
      const createdFacility = await facilityModel.findOne({ name: "General Hospital" });
      expect(createdFacility.properties.city).toBe("Nairobi");
    });

    it("requires geometry coordinates", async () => {
      await expect(facilityService.addFacility(facilityMissingGeometry)).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    });

    it("requires essential property fields like address", async () => {
      // Should fail because propertiesSchema requires address
      await expect(facilityService.addFacility(facilityMissingRequiredProps)).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    });

    it("enforces enum for geometry.point", async () => {
      const invalidPoint = {
        ...facilityComplete,
        geometry: { point: "NotAPoint", coordinates: [0, 0] },
      };
      await expect(facilityService.addFacility(invalidPoint)).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });
});
