const { defineConfig } = require('cypress')

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportFilename: 'index',
    reportPageTitle: 'ServeRest - Testes de API',
    charts: true,
    saveJson: true,
    saveHtml: true,
    inlineAssets: true,
    overwrite: false,
    quiet: true
  },
  e2e: {
    baseUrl: process.env.API_BASE_URL || 'https://serverest.dev',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: false,
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 15000,
    responseTimeout: 30000,
    retries: {
      runMode: 1,
      openMode: 0
    },
    env: {
      intervaloEntreRequisicoes: 700,
      idInexistente: 'z9AhYd7pQxLmR2Nv'
    },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)

      return config
    }
  }
})
