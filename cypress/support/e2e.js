import 'cypress-mochawesome-reporter/register'
import './commands'
import { consumir } from './limpeza'

Cypress.on('uncaught:exception', () => false)

afterEach(() => {
  consumir().forEach((id) => cy.api({ method: 'DELETE', url: `/usuarios/${id}` }))
})
