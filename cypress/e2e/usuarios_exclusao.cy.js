import { gerarUsuario } from '../support/factories/usuario.factory'
import usuarios from '../support/services/usuarios.service'
import { descartar } from '../support/limpeza'

describe('DELETE /usuarios/{_id}', () => {
  it('Exclui o usuário cadastrado e remove o registro da base', () => {
    cy.cadastrarUsuario(gerarUsuario()).then((usuario) => {
      usuarios.excluir(usuario._id).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.message).to.eq('Registro excluído com sucesso')

        descartar(usuario._id)

        usuarios.buscarPorId(usuario._id).then((consulta) => {
          expect(consulta.status).to.eq(400)
          expect(consulta.body.message).to.eq('Usuário não encontrado')
        })
      })
    })
  })

  it('Retorna aviso ao excluir ID', () => {
    usuarios.excluir(Cypress.env('idInexistente')).then(({ status, body }) => {
      expect(status).to.eq(200)
      expect(body.message).to.eq('Nenhum registro excluído')
    })
  })
})
