module.exports = {
  globalSetup: "./src/setup-jest.js",
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.js", "!<rootDir>/src/index.js", "!**/node_modules/**"],
  rootDir: "./",
  testMatch: ["<rootDir>/src/**/__tests__/**/?(*.)(spec|test).js", "<rootDir>/src/**/?(*.)(spec|test).js"],
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["<rootDir>/src/database/*.js", "<rootDir>/src/middlewares/index.js"],
  moduleFileExtensions: ["js", "json"],
};
