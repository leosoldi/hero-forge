# Hero Forge — API

API REST do Hero Forge, construída com NestJS, TypeORM e MySQL.

## Configuração

```bash
cp .env.example .env
```

| Variável      | Padrão                  | Descrição                                   |
| ------------- | ----------------------- | ------------------------------------------- |
| `NODE_ENV`    | `development`           | `development`, `test` ou `production`       |
| `PORT`        | `3333`                  | Porta HTTP da API                           |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem liberada para o front-end            |
| `DB_HOST`     | —                       | Host do MySQL                               |
| `DB_PORT`     | `3306`                  | Porta do MySQL                              |
| `DB_USERNAME` | —                       | Usuário do banco                            |
| `DB_PASSWORD` | —                       | Senha do banco                              |
| `DB_DATABASE` | —                       | Nome do banco                               |
| `DB_LOGGING`  | `false`                 | Exibe as queries SQL no console             |

As variáveis são validadas na inicialização: se alguma estiver ausente ou inválida, a API não sobe e informa o motivo.

## Scripts

| Script               | Descrição                                        |
| -------------------- | ------------------------------------------------ |
| `npm run start:dev`  | Sobe a API em modo watch                         |
| `npm run build`      | Compila para `dist/`                             |
| `npm run start:prod` | Executa a versão compilada                       |
| `npm run lint`       | Análise estática com oxlint                      |
| `npm run format`     | Formata o código com Prettier                    |
| `npm test`           | Testes unitários (Vitest)                        |
| `npm run test:cov`   | Testes unitários com cobertura                   |
| `npm run test:e2e`   | Testes de integração (exige o MySQL rodando)     |
| `npm run migration:show`   | Lista as migrations e quais já foram aplicadas |
| `npm run migration:run`    | Aplica as migrations pendentes                 |
| `npm run migration:revert` | Desfaz a última migration aplicada             |
| `npm run schema:check`     | Compara entidades e banco (deve estar em dia)  |

Os testes de integração usam o banco `hero_forge_test`, isolado do banco de desenvolvimento.

## Banco de dados

O schema é versionado por **migrations** (`src/database/migrations`). O `synchronize` do TypeORM fica desligado: nenhuma alteração de estrutura acontece sem uma migration.

Ao iniciar, a API aplica automaticamente as migrations pendentes. Os comandos acima servem para inspecionar ou desfazer manualmente.

### Tabela `heroes`

| Coluna          | Tipo            | Observação                                  |
| --------------- | --------------- | ------------------------------------------- |
| `id`            | `char(36)`      | UUID v4 gerado pela aplicação               |
| `name`          | `varchar(120)`  | Nome completo                               |
| `nickname`      | `varchar(80)`   | Nome de guerra                              |
| `date_of_birth` | `date`          | Data de nascimento                          |
| `universe`      | `varchar(60)`   | Universo                                    |
| `main_power`    | `varchar(120)`  | Habilidade principal                        |
| `avatar_url`    | `varchar(2048)` | URL do avatar                               |
| `is_active`     | `tinyint(1)`    | Exclusão lógica (`false` = excluído)        |
| `created_at`    | `datetime(3)`   | UTC, com milissegundos; indexado            |
| `updated_at`    | `datetime(3)`   | UTC, com milissegundos                      |

## Arquitetura

```
src/
├── config/              # Validação das variáveis de ambiente
├── database/            # Conexão, data source da CLI e migrations
├── shared/domain/       # Base dos erros de domínio e tipos de paginação
└── modules/
    ├── health/          # GET /health
    └── heroes/
        ├── domain/                       # Entidade Hero, regras de negócio e contrato do repositório
        ├── application/use-cases/        # Um caso de uso por ação (criar, listar, detalhar, editar, desativar, ativar)
        ├── infrastructure/persistence/   # Entidade do TypeORM, mapper e implementação do repositório
        └── heroes.module.ts              # Composition root: liga o contrato à implementação
test/
├── support/             # Factory de heróis e repositório em memória (dublê de testes)
└── heroes/              # Testes de integração do repositório com o MySQL
```

- O **domínio** não conhece NestJS nem TypeORM. O repositório é uma classe abstrata (`HeroRepository`) que serve ao mesmo tempo de contrato e de token de injeção.
- Os **casos de uso** recebem o repositório pelo construtor e também não dependem do framework. O `HeroesModule` os instancia via `useFactory`.
- A **implementação** (`TypeOrmHeroRepository`) é a única peça que fala com o banco, traduzindo com o `HeroMapper`.

## Testes

- **Unitários** (`*.spec.ts`, ao lado do código): domínio e casos de uso usam o `InMemoryHeroRepository`, então rodam sem banco e em milissegundos.
- **Integração** (`test/**/*.e2e-spec.ts`): rodam contra o MySQL real, no banco `hero_forge_test`. Os testes fixam o fuso `America/Sao_Paulo` para garantir que datas não "voltam um dia" fora do UTC.
