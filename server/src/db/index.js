import mongoose from 'mongoose';
import environment from '../config/environment';

// Export models for app use
export { default as Facility } from './models/Facility';

/**
 * Initializes the database connection and sets up event listeners for MongoDB connection states.
 *
 * This function connects to the MongoDB database using the URL from the environment configuration,
 * and registers event listeners to handle connection success, errors, and disconnections.
 * It also listens for process termination signals to close the MongoDB connection gracefully.
 *
 * @param {Function} logger - A logging function used to log connection states and errors.
 */
export const initializeDB = (logger) => {
  // Connect to MongoDB using the provided DB URL from the environment configuration
  mongoose.connect(environment.DB_URL);

  // Event listener for successful connection
  mongoose.connection.on('connected', () => {
    logger('database connected');
  });

  // Event listener for errors during the connection
  mongoose.connection.on('error', () => {
    logger('database connection error:');
  });

  // Event listener for when the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    logger('database disconnected');
  });

  // Gracefully close the connection if the node process is terminated
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger('database disconnected through app termination');
      process.exit(0);
    });
  });
};
