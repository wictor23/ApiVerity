import { faker } from '@faker-js/faker/locale/pt_BR'

const DOMINIO = 'qa.serverest.dev'

const montarEmail = (nome) => {
  const base = faker.helpers.slugify(nome).toLowerCase().replace(/[^a-z0-9.-]/g, '')
  const sufixo = faker.string.alphanumeric({ length: 6, casing: 'lower' })

  return `${base}.${sufixo}@${DOMINIO}`
}

export const gerarUsuario = (sobrescritas = {}) => {
  const nome = faker.person.fullName()

  return {
    nome,
    email: montarEmail(nome),
    password: faker.internet.password({ length: 12, memorable: false }),
    administrador: 'true',
    ...sobrescritas
  }
}

export const gerarCredenciais = ({ email, password }) => ({ email, password })
