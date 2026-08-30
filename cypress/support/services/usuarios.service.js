const ROTA = '/usuarios'

const listar = (parametros = {}) => cy.api({ method: 'GET', url: ROTA, qs: parametros })

const buscarPorId = (id) => cy.api({ method: 'GET', url: `${ROTA}/${id}` })

const criar = (corpo) => cy.api({ method: 'POST', url: ROTA, body: corpo })

const atualizar = (id, corpo) => cy.api({ method: 'PUT', url: `${ROTA}/${id}`, body: corpo })

const excluir = (id) => cy.api({ method: 'DELETE', url: `${ROTA}/${id}` })

export default { listar, buscarPorId, criar, atualizar, excluir }
