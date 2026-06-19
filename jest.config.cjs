/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Où se trouvent les tests
  roots: ["<rootDir>/tests"],

  // Extensions supportées
  moduleFileExtensions: ["ts", "js", "json"],

  // Transformation TypeScript
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },

  // Pas besoin d'importer describe/test/expect
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },

  // Nettoyage entre les tests
  clearMocks: true,

  // Couverture (désactivée par défaut)
  collectCoverage: false,
};
