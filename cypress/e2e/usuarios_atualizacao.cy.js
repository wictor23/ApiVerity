import { gerarUsuario } from '../support/factories/usuario.factory'
import usuarios from '../support/services/usuarios.service'
import { registrar } from '../support/limpeza'

const criticas = [
  { campo: 'nome', valor: '', mensagem: 'nome não pode ficar em branco' },
  { campo: 'email', valor: 'teste#qa', mensagem: 'email deve ser um email válido' },
  { campo: 'administrador', valor: 'sim', mensagem: "administrador deve ser 'true' ou 'false'" }
]

describe('PUT /usuarios/{_id}', () => {
  it('Atualiza nome e e-mail de um usuário existente', () => {
    cy.cadastrarUsuario(gerarUsuario()).then((usuario) => {
      const alterado = gerarUsuario({
        password: usuario.password,
        administrador: usuario.administrador
      })

      usuarios.atualizar(usuario._id, alterado).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.message).to.eq('Registro alterado com sucesso')

        usuarios.buscarPorId(usuario._id).then((consulta) => {
          expect(consulta.body.nome).to.eq(alterado.nome)
          expect(consulta.body.email).to.eq(alterado.email)
        })
      })
    })
  })

  it('Cadastra novo registro ao atualizar ID inexistente', () => {
    const usuario = gerarUsuario()

    usuarios.atualizar(Cypress.env('idInexistente'), usuario).then(({ status, body }) => {
      expect(status).to.eq(201)
      expect(body.message).to.eq('Cadastro realizado com sucesso')
      expect(body._id).to.be.a('string').and.to.have.length(16)

      registrar(body._id)
    })
  })

  it('Tentar cadastrar usuário com e-mail já existente', () => {
    cy.cadastrarUsuario(gerarUsuario()).then((primeiro) => {
      cy.cadastrarUsuario(gerarUsuario()).then((segundo) => {
        const corpo = gerarUsuario({ email: primeiro.email })

        usuarios.atualizar(segundo._id, corpo).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body.message).to.eq('Este email já está sendo usado')
        })
      })
    })
  })

  criticas.forEach(({ campo, valor, mensagem }) => {
    const descricao = valor === '' ? 'em branco' : `igual a "${valor}"`

    it(`Recusando atualização dos campos ${campo} ${descricao}`, () => {
      cy.cadastrarUsuario(gerarUsuario()).then((usuario) => {
        const corpo = gerarUsuario({ [campo]: valor })

        usuarios.atualizar(usuario._id, corpo).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body).to.have.property(campo, mensagem)
        })
      })
    })
  })
})
