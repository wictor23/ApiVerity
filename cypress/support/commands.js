import { registrar } from './limpeza'

const intervalo = () => Cypress.env('intervaloEntreRequisicoes') || 200

Cypress.Commands.add('api', (opcoes) => {
  return cy.wait(intervalo(), { log: false }).request({
    failOnStatusCode: false,
    ...opcoes
  })
})

Cypress.Commands.add('cadastrarUsuario', (usuario) =>
  cy.api({ method: 'POST', url: '/usuarios', body: usuario }).then(({ status, body }) => {
    expect(status).to.eq(201)
    registrar(body._id)

    return { ...usuario, _id: body._id }
  })
)
