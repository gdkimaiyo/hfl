import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod; // Declare the mongod instance outside to be accessible

module.exports.connect = async () => {
  // Create a new MongoMemoryServer instance (this starts the in-memory DB)
  mongod = await MongoMemoryServer.create();

  // Get the URI after the instance is created and started
  const uri = mongod.getUri();

  // Connect mongoose to the in-memory MongoDB instance
  await mongoose.connect(uri, {});
};

module.exports.clearDatabase = async () => {
  // Clear the database between tests if needed
  await mongoose.connection.dropDatabase();
};

module.exports.closeDatabase = async () => {
  // Close the mongoose connection and stop the in-memory DB server
  await mongoose.connection.close();
  await mongod.stop(); // Stop the in-memory server
};
