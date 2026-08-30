import { gerarUsuario } from '../support/factories/usuario.factory'
import usuarios from '../support/services/usuarios.service'

const CAMPOS_OBRIGATORIOS = ['_id', 'nome', 'email', 'password', 'administrador']

describe('GET /usuarios', () => {
  it('Lista os usuários cadastrados', () => {
    usuarios.listar().then(({ status, body }) => {
      expect(status).to.eq(200)
      expect(body.usuarios).to.be.an('array')
      expect(body.quantidade).to.eq(body.usuarios.length)

      body.usuarios.forEach((registro) => {
        CAMPOS_OBRIGATORIOS.forEach((campo) => expect(registro).to.have.property(campo))
      })
    })
  })

  it('Busca o usuário pelo ID', () => {
    cy.cadastrarUsuario(gerarUsuario()).then((usuario) => {
      usuarios.buscarPorId(usuario._id).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body).to.deep.include({
          _id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          administrador: usuario.administrador
        })
      })
    })
  })

  it('Retorna identificador inexistente', () => {
    usuarios.buscarPorId(Cypress.env('idInexistente')).then(({ status, body }) => {
      expect(status).to.eq(400)
      expect(body.message).to.eq('Usuário não encontrado')
    })
  })

  it('Filtra a listagem pelo e-mail do usuário', () => {
    cy.cadastrarUsuario(gerarUsuario()).then((usuario) => {
      usuarios.listar({ email: usuario.email }).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.quantidade).to.eq(1)
        expect(body.usuarios[0].email).to.eq(usuario.email)
      })
    })
  })
})
