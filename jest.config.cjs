const config = {
  collectCoverageFrom: [
    "**/*.ts",
    "!src/index.ts",
    "!src/ext.ts",
    "!src/object-properties.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  reporters: [["github-actions", { silent: false }], "default"],
  testEnvironment: "jsdom",
  verbose: true,
};

module.exports = config;
