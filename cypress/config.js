/**
 * cypress.config.js — Cypress configuration for the Memory Matching Game.
 * Base URI points to the dev server on port 8080.
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: false,
  },
});
