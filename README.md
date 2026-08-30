# Testes automatizados da API ServeRest (Mocha)

Mesma cobertura da suíte em Gherkin, escrita no padrão nativo do Cypress: `describe` / `it` do Mocha com asserções Chai, sem camada BDD.

## Stack

| Item | Escolha |
| --- | --- |
| Runner | Cypress 13 (`cy.request`, sem browser) |
| Estrutura de testes | Mocha (describe/it) + Chai |
| Massa de dados | @faker-js/faker (locale pt_BR) |
| Relatório | cypress-mochawesome-reporter |
| CI | GitHub Actions |

## Pré-requisitos

- Node.js 20 (arquivo `.nvmrc` incluso)
- npm 9 ou superior

## Instalação

```bash
git clone <url-do-repositorio>
cd serverest-api-tests-mocha
npm install
```

## Execução

```bash
npm test                  # suíte completa em modo headless
npm run abrir             # Test Runner do Cypress
npm run test:cadastro
npm run test:consulta
npm run test:atualizacao
npm run test:exclusao
npm run test:auth
```

Filtrando por nome do teste, recurso do próprio Mocha:

```bash
npx cypress run --spec cypress/e2e/usuarios_cadastro.cy.js --env grep="e-mail já utilizado"
```

Apontando para outro ambiente:

```bash
API_BASE_URL=https://minha-instancia-serverest.dev npm test
```

## Estrutura

```
cypress
├── e2e
│   ├── autenticacao.cy.js
│   ├── usuarios_atualizacao.cy.js
│   ├── usuarios_cadastro.cy.js
│   ├── usuarios_consulta.cy.js
│   └── usuarios_exclusao.cy.js
└── support
    ├── commands.js       cy.api com throttle e cy.cadastrarUsuario
    ├── e2e.js            registro do reporter e limpeza automática
    ├── limpeza.js        controle síncrono dos registros criados no teste
    ├── factories         geração de usuários com Faker
    └── services          camada de acesso aos endpoints
.github/workflows         pipeline de CI
```

Cada arquivo de spec corresponde a um verbo do recurso, e o `describe` recebe o nome do endpoint (`POST /usuarios`, `PUT /usuarios/{_id}`). Isso faz o relatório do Mochawesome sair agrupado por rota, sem precisar de tag ou configuração extra.

## Diferenças em relação à suíte com Cucumber

| Aspecto | Cucumber | Mocha |
| --- | --- | --- |
| Especificação | `.feature` em português, legível por quem não programa | `describe`/`it` em JavaScript |
| Reuso | Passos compartilhados entre features, com risco de ambiguidade | Funções e comandos customizados, resolução direta |
| Casos parametrizados | Esquema do Cenário com tabela de Exemplos | `forEach` sobre um array de casos |
| Estado entre passos | Objeto de contexto e `cy.then` para adiar asserções | Encadeamento de `.then`, sem estado global |
| Camadas até o teste | feature, step, service | spec, service |
| Relatório | multiple-cucumber-html-reporter | cypress-mochawesome-reporter |

Na prática o Mocha é mais direto: as asserções ficam dentro do `.then` da requisição, então não existe o problema de fila do Cypress que obriga o Cucumber a embrulhar cada verificação em `cy.then`. Em compensação, perde-se a documentação viva em linguagem de negócio.

## Observações sobre a API

- O documento do desafio cita as rotas como `/users`. Na instância pública o recurso é `/usuarios`, e é esse caminho que a suíte utiliza.
- A autenticação é feita em `POST /login`, que devolve `authorization` no formato `Bearer <jwt>`. As rotas de produtos entram apenas para comprovar bloqueio e liberação de acesso.
- A API rejeita cadastros com e-mail de gmail e hotmail. A factory gera endereços em `qa.serverest.dev`.
- Limite de 100 requisições por minuto. O `cy.api` aplica intervalo entre chamadas, controlado por `intervaloEntreRequisicoes` no `cypress.config.js` (padrão de 700 ms).
- O `afterEach` global remove os usuários registrados durante o teste, mantendo a base compartilhada previsível. O registro é feito por funções síncronas em `support/limpeza.js`, e não por comando Cypress, para não misturar fila assíncrona com retorno de valor dentro dos callbacks.

## Cobertura

27 testes, mesma paridade da suíte em Gherkin.

### POST /usuarios — 8 testes

Cadastro de administrador com consulta posterior, cadastro sem perfil administrativo, e-mail duplicado e cinco combinações de campos inválidos.

### GET /usuarios e GET /usuarios/{_id} — 4 testes

Listagem com validação de contrato e coerência da `quantidade`, busca por identificador, identificador inexistente e filtro por e-mail.

### PUT /usuarios/{_id} — 6 testes

Alteração com verificação de persistência, upsert em identificador inexistente, e-mail de outro usuário e três combinações de campos inválidos.

### DELETE /usuarios/{_id} — 2 testes

Exclusão com confirmação de que o registro deixou de existir e aviso em identificador inexistente.

### POST /login — 7 testes

Token com credenciais válidas, senha incorreta, três combinações de campos obrigatórios, rota protegida sem token e rota protegida com token válido.

## Relatórios

Depois de `npm test`, os artefatos ficam em `cypress/reports`:

- `index.html` — relatório navegável com gráficos, duração e detalhe por teste
- `.jsons/` — saída bruta do Mochawesome, útil para integrações

O relatório é gerado ao final da execução, inclusive quando há falhas, e o workflow publica a pasta inteira como artefato `relatorio-testes-api-mocha`.

## Pontos de atenção conhecidos

- A base do ServeRest é pública e compartilhada. As asserções de listagem validam consistência estrutural em vez de quantidades fixas.
- `retries` habilitado com uma tentativa em modo headless, para absorver instabilidade da instância pública sem mascarar falha real.
- O `PUT` com identificador inexistente cria um novo registro. Está coberto como caso positivo por ser o contrato documentado da API.
