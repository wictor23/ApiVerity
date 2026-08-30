import { gerarUsuario } from '../support/factories/usuario.factory'
import usuarios from '../support/services/usuarios.service'
import { registrar } from '../support/limpeza'

const criticas = [
  { campo: 'nome', valor: '', mensagem: 'nome não pode ficar em branco' },
  { campo: 'email', valor: '', mensagem: 'email não pode ficar em branco' },
  { campo: 'email', valor: 'fulano.qa.com', mensagem: 'email deve ser um email válido' },
  { campo: 'password', valor: '', mensagem: 'password não pode ficar em branco' },
  { campo: 'administrador', valor: 'talvez', mensagem: "administrador deve ser 'true' ou 'false'" }
]

describe('POST /usuarios', () => {
  it('Cadastra usuário administrador', () => {
    const usuario = gerarUsuario()

    usuarios.criar(usuario).then(({ status, body }) => {
      expect(status).to.eq(201)
      expect(body.message).to.eq('Cadastro realizado com sucesso')
      expect(body._id).to.be.a('string').and.to.have.length(16)

      registrar(body._id)

      usuarios.buscarPorId(body._id).then((consulta) => {
        expect(consulta.status).to.eq(200)
        expect(consulta.body).to.deep.include({
          nome: usuario.nome,
          email: usuario.email,
          administrador: 'true'
        })
      })
    })
  })

  it('Cadastra usuário sem perfil administrativo', () => {
    const usuario = gerarUsuario({ administrador: 'false' })

    usuarios.criar(usuario).then(({ status, body }) => {
      expect(status).to.eq(201)
      registrar(body._id)

      usuarios.buscarPorId(body._id).then((consulta) => {
        expect(consulta.body.administrador).to.eq('false')
      })
    })
  })

  it('Valida cadastro com e-mail já utilizado', () => {
    cy.cadastrarUsuario(gerarUsuario()).then((existente) => {
      const duplicado = gerarUsuario({ email: existente.email })

      usuarios.criar(duplicado).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body.message).to.eq('Este email já está sendo usado')
      })
    })
  })

  criticas.forEach(({ campo, valor, mensagem }) => {
    const descricao = valor === '' ? 'em branco' : `igual a "${valor}"`

    it(`Recusando cadastro com o campo ${campo} ${descricao}`, () => {
      const corpo = gerarUsuario({ [campo]: valor })

      usuarios.criar(corpo).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.have.property(campo, mensagem)
      })
    })
  })
})
