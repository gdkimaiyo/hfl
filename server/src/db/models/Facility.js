import mongoose from "mongoose";

const { Schema } = mongoose;

const propertiesSchema = new Schema(
  {
    phone: { type: String, required: false },
    email: { type: String, required: false },
    name: { type: String, required: true },
    address: { type: String, required: true },
    mailingAddress: { type: String, required: false },
    city: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: false },
    state: { type: String, required: true },
    type: { type: String, required: true, default: "Hospital" },
    level: { type: Number, required: true, default: 2 },
    isPrivate: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

const geometrySchema = new Schema(
  {
    point: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  { _id: false },
);

const facilitySchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Feature"], required: true, default: "Feature" },
  // geometry: geometrySchema,
  geometry: {
    type: geometrySchema,
    required: [true, "Geometry data is mandatory"],
  },
  properties: propertiesSchema,
  created: { type: Date, default: Date.now },
  updated: { type: Date },
});

const Facility = mongoose.model("facilities", facilitySchema);

export default Facility;
