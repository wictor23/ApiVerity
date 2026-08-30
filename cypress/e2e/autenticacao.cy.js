import { gerarUsuario, gerarCredenciais } from '../support/factories/usuario.factory'
import login from '../support/services/login.service'

const criticas = [
  { email: '', senha: '123456', campo: 'email', mensagem: 'email não pode ficar em branco' },
  { email: 'fulano@qa.com', senha: '', campo: 'password', mensagem: 'password não pode ficar em branco' },
  { email: 'fulano.qa.com', senha: '123456', campo: 'email', mensagem: 'email deve ser um email válido' }
]

describe('POST /login', () => {
  let usuario

  beforeEach(() => {
    cy.cadastrarUsuario(gerarUsuario()).then((cadastrado) => {
      usuario = cadastrado
    })
  })

  it('Gerando token com credenciais válidas', () => {
    login.autenticar(gerarCredenciais(usuario)).then(({ status, body }) => {
      expect(status).to.eq(200)
      expect(body.message).to.eq('Login realizado com sucesso')
      expect(body.authorization).to.match(/^Bearer .+\..+\..+$/)
    })
  })

  it('Recusando login com senha incorreta', () => {
    login.autenticar({ email: usuario.email, password: 'Senh4Errada!' }).then(({ status, body }) => {
      expect(status).to.eq(401)
      expect(body.message).to.eq('Email e/ou senha inválidos')
    })
  })

  criticas.forEach(({ email, senha, campo, mensagem }) => {
    const descricao = email === '' ? 'e-mail em branco' : senha === '' ? 'senha em branco' : 'e-mail inválido'

    it(`Validando campo obrigatório do login com ${descricao}`, () => {
      login.autenticar({ email, password: senha }).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.have.property(campo, mensagem)
      })
    })
  })

  it('bloqueia rota quando o token não é informado', () => {
    login.excluirProduto(Cypress.env('idInexistente')).then(({ status, body }) => {
      expect(status).to.eq(401)
      expect(body.message).to.eq(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
      )
    })
  })

  it('Valida rota quando é token válido', () => {
    login.autenticar(gerarCredenciais(usuario)).then((autenticacao) => {
      login
        .excluirProduto(Cypress.env('idInexistente'), autenticacao.body.authorization)
        .then(({ status, body }) => {
          expect(status).to.eq(200)
          expect(body.message).to.eq('Nenhum registro excluído')
        })
    })
  })
})
