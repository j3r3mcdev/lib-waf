/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  roots: ["<rootDir>/tests"],

  moduleFileExtensions: ["ts", "js", "json"],

  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },

  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },

  clearMocks: true,
  collectCoverage: false,
};
