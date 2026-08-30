const autenticar = (credenciais) => cy.api({ method: 'POST', url: '/login', body: credenciais })

const excluirProduto = (id, token) =>
  cy.api({
    method: 'DELETE',
    url: `/produtos/${id}`,
    headers: token ? { authorization: token } : {}
  })

export default { autenticar, excluirProduto }
