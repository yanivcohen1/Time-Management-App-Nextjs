import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    reporter: process.env.CYPRESS_REPORTER || 'spec',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: true,
      html: true,
      json: false
    },
    setupNodeEvents(on, config) { // eslint-disable-line @typescript-eslint/no-unused-vars
      if (process.env.CYPRESS_REPORTER === 'cypress-mochawesome-reporter') {
        require('cypress-mochawesome-reporter/plugin')(on); // eslint-disable-line @typescript-eslint/no-require-imports
      }
      // implement node event listeners here
    },
  },
  // types: ['cypress'],
})