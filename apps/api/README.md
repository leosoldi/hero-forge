# Hero Forge — API

API REST do Hero Forge, construída com NestJS, TypeORM e MySQL.

## Configuração

```bash
cp .env.example .env
```

| Variável                 | Padrão                                     | Descrição                                                |
| ------------------------ | ------------------------------------------ | -------------------------------------------------------- |
| `NODE_ENV`               | `development`                              | `development`, `test` ou `production`                    |
| `PORT`                   | `3333`                                     | Porta HTTP da API                                        |
| `CORS_ORIGIN`            | `http://localhost:5173`                    | Origem liberada para o front-end                         |
| `DB_HOST`                | —                                          | Host do MySQL                                            |
| `DB_PORT`                | `3306`                                     | Porta do MySQL                                           |
| `DB_USERNAME`            | —                                          | Usuário do banco                                         |
| `DB_PASSWORD`            | —                                          | Senha do banco                                           |
| `DB_DATABASE`            | —                                          | Nome do banco                                            |
| `DB_LOGGING`             | `false`                                    | Exibe as queries SQL no console                          |
| `UPLOADS_DIR`            | `storage/uploads`                          | Pasta onde as imagens enviadas são gravadas              |
| `PUBLIC_UPLOADS_URL`     | `http://localhost:3333/uploads`            | URL pública usada para montar o endereço das imagens     |
| `AI_PROVIDER`            | `demo`                                     | `demo` (offline, sem chave) ou `cloudflare` (Workers AI) |
| `CLOUDFLARE_ACCOUNT_ID`  | —                                          | Obrigatória quando `AI_PROVIDER=cloudflare`              |
| `CLOUDFLARE_API_TOKEN`   | —                                          | Obrigatória quando `AI_PROVIDER=cloudflare`              |
| `CLOUDFLARE_TEXT_MODEL`  | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | LLM que gera os dados e a história                       |
| `CLOUDFLARE_IMAGE_MODEL` | `@cf/black-forest-labs/flux-1-schnell`     | Modelo que gera o avatar                                 |

As variáveis são validadas na inicialização: se alguma estiver ausente ou inválida, a API não sobe e informa o motivo.

## Scripts

| Script                     | Descrição                                      |
| -------------------------- | ---------------------------------------------- |
| `npm run start:dev`        | Sobe a API em modo watch                       |
| `npm run build`            | Compila para `dist/`                           |
| `npm run start:prod`       | Executa a versão compilada                     |
| `npm run lint`             | Análise estática com oxlint                    |
| `npm run format`           | Formata o código com Prettier                  |
| `npm test`                 | Testes unitários (Vitest)                      |
| `npm run test:cov`         | Testes unitários com cobertura                 |
| `npm run test:e2e`         | Testes de integração (exige o MySQL rodando)   |
| `npm run migration:show`   | Lista as migrations e quais já foram aplicadas |
| `npm run migration:run`    | Aplica as migrations pendentes                 |
| `npm run migration:revert` | Desfaz a última migration aplicada             |
| `npm run schema:check`     | Compara entidades e banco (deve estar em dia)  |

Os testes de integração usam o banco `hero_forge_test`, isolado do banco de desenvolvimento.

## Endpoints

Documentação interativa (Swagger): **http://localhost:3333/docs**. Há também exemplos prontos em [`requests.http`](requests.http) para a extensão REST Client do VS Code.

| Método   | Rota                     | Descrição                                       | Sucesso |
| -------- | ------------------------ | ----------------------------------------------- | ------- |
| `GET`    | `/heroes`                | Lista paginada (`page`, `limit`, `search`)      | `200`   |
| `GET`    | `/heroes/:id`            | Detalha um herói                                | `200`   |
| `POST`   | `/heroes`                | Cria um herói                                   | `201`   |
| `PUT`    | `/heroes/:id`            | Edita os campos editáveis de um herói ativo     | `200`   |
| `DELETE` | `/heroes/:id`            | Exclusão lógica (o herói fica inativo)          | `200`   |
| `PATCH`  | `/heroes/:id/activate`   | Reativa um herói inativo                        | `200`   |
| `POST`   | `/uploads/images`        | Envia uma imagem (campo `file`) e retorna a URL | `201`   |
| `POST`   | `/hero-suggestions`      | Sugere um herói com IA generativa (não salva)   | `200`   |
| `GET`    | `/hero-suggestions/info` | Provedor de IA ativo e limite diário            | `200`   |
| `GET`    | `/health`                | Verifica se a API e o banco estão no ar         | `200`   |

- A listagem retorna `{ data: [...], meta: { page, limit, total, total_pages } }`, dos mais recentes para os mais antigos. `limit` padrão: 10 (máximo 50).
- Os campos `id`, `is_active`, `created_at` e `updated_at` não podem ser enviados pelo cliente: a requisição é rejeitada com `400`.
- `date_of_birth` é aceito como `YYYY-MM-DD` ou `YYYY-MM-DD 00:00:00` e validado de forma estrita (`2026-02-31` é rejeitado).

### Upload de imagens

`POST /uploads/images` (multipart, campo `file`) aceita JPEG, PNG ou WebP de até 2 MB e responde `{ "url": "..." }`, que o front usa como `avatar_url`. O contrato do herói não muda.

- O tipo é validado pelos **bytes do arquivo** (assinatura), não pela extensão nem pelo `Content-Type` informado pelo cliente. SVG não é aceito, porque pode conter scripts.
- O arquivo é salvo com um nome aleatório (UUID), o que evita sobrescrita e nomes maliciosos.
- O armazenamento fica atrás da porta `FileStorage`. Hoje a implementação é `LocalFileStorage` (disco, servido em `/uploads`); trocar por S3 é criar outro adapter e mudar uma linha no `UploadsModule`.

### Sugestão de herói com IA generativa

`POST /hero-suggestions` (corpo opcional `{ "idea": "..." }`) devolve nome, nome de guerra, data de nascimento, universo, habilidade, uma **história** e a URL de um **avatar gerado**. Nada é persistido: o front preenche o formulário e o usuário revisa antes de criar pelo `POST /heroes`.

- Um **LLM** gera os dados e a história em JSON (modo JSON com schema); um **modelo de imagem** gera o avatar, que é salvo pela mesma porta `FileStorage` do upload (o link do provedor não é permanente).
- As duas gerações ficam atrás das portas `HeroIdeaGenerator` e `AvatarGenerator`. Há dois adapters de cada:
  - `demo` (padrão): offline, sem chave e sem custo. Quem avalia o projeto consegue testar o botão sem criar conta.
  - `cloudflare`: [Workers AI](https://developers.cloudflare.com/workers-ai/), que tem cota gratuita diária e gera texto **e** imagem.
- A resposta da IA é normalizada antes de sair da API (tamanhos máximos, data válida) e campos obrigatórios ausentes viram `503 AI_UNAVAILABLE`. Se só a imagem falhar, a sugestão volta com `avatar_url: null`.
- A chave fica apenas na API, nunca no front.
- `GET /hero-suggestions/info` informa o provedor ativo e o limite diário, usado pelo ícone de informação ao lado do botão no front:
  - `demo`: `{ "provider": "demo", "daily_limit": null, "resets_at_utc": null }` (sem limite).
  - `cloudflare`: `{ "provider": "cloudflare", "daily_limit": 100, "resets_at_utc": "00:00" }`. O plano gratuito dá 10.000 _neurons_ por dia, o que rende cerca de 100 sugestões completas (texto + imagem). A cota renova às 00:00 UTC (21h em Brasília). Se acabar, a API responde `503 AI_UNAVAILABLE` e o front mostra a mensagem de erro.

**Ativando a IA real (gratuito):** crie uma conta em [dash.cloudflare.com](https://dash.cloudflare.com), vá em _AI → Workers AI → Use REST API_, copie o **Account ID** e crie um **API Token**. No `apps/api/.env`:

```env
AI_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=seu-account-id
CLOUDFLARE_API_TOKEN=seu-token
```

### Erros

Todos os erros seguem o mesmo formato:

```json
{
  "status_code": 409,
  "code": "HERO_INACTIVE",
  "message": "Hero e314636e-... is inactive and cannot be updated"
}
```

| Status | `code`                                                                       | Quando                                               |
| ------ | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| `400`  | `VALIDATION_ERROR` (com `details` por campo), `BAD_REQUEST`, `FILE_REQUIRED` | Corpo, query, id ou arquivo inválidos                |
| `404`  | `HERO_NOT_FOUND`, `NOT_FOUND`                                                | Herói ou rota inexistente                            |
| `409`  | `HERO_INACTIVE`, `HERO_ALREADY_ACTIVE`, `HERO_ALREADY_INACTIVE`              | Ação incompatível com o estado do herói              |
| `413`  | `PAYLOAD_TOO_LARGE`                                                          | Imagem acima de 2 MB                                 |
| `422`  | `INVALID_HERO`, `INVALID_IMAGE`                                              | Regra de negócio violada ou arquivo que não é imagem |
| `500`  | `INTERNAL_ERROR`                                                             | Erro inesperado (detalhes só no log)                 |

## Banco de dados

O schema é versionado por **migrations** (`src/database/migrations`). O `synchronize` do TypeORM fica desligado: nenhuma alteração de estrutura acontece sem uma migration.

Ao iniciar, a API aplica automaticamente as migrations pendentes. Os comandos acima servem para inspecionar ou desfazer manualmente.

### Tabela `heroes`

| Coluna          | Tipo            | Observação                           |
| --------------- | --------------- | ------------------------------------ |
| `id`            | `char(36)`      | UUID v4 gerado pela aplicação        |
| `name`          | `varchar(120)`  | Nome completo                        |
| `nickname`      | `varchar(80)`   | Nome de guerra                       |
| `date_of_birth` | `date`          | Data de nascimento                   |
| `universe`      | `varchar(60)`   | Universo                             |
| `main_power`    | `varchar(120)`  | Habilidade principal                 |
| `avatar_url`    | `varchar(2048)` | URL do avatar                        |
| `is_active`     | `tinyint(1)`    | Exclusão lógica (`false` = excluído) |
| `created_at`    | `datetime(3)`   | UTC, com milissegundos; indexado     |
| `updated_at`    | `datetime(3)`   | UTC, com milissegundos               |

## Arquitetura

```
src/
├── config/              # Validação das variáveis de ambiente
├── database/            # Conexão, data source da CLI e migrations
├── docs/                # Configuração do Swagger
├── shared/
│   ├── domain/          # Base dos erros de domínio e tipos de paginação
│   └── presentation/    # Filtro global de erros, formato de datas e validadores
└── modules/
    ├── health/          # GET /health
    ├── uploads/         # Upload de imagens (porta FileStorage + armazenamento local)
    ├── hero-suggestions/ # Sugestão com IA generativa (portas + adapters Cloudflare e demo)
    └── heroes/
        ├── domain/                       # Entidade Hero, regras de negócio e contrato do repositório
        ├── application/use-cases/        # Um caso de uso por ação (criar, listar, detalhar, editar, desativar, ativar)
        ├── infrastructure/persistence/   # Entidade do TypeORM, mapper e implementação do repositório
        ├── presentation/                 # Controller REST, DTOs, presenter e tipos de resposta
        └── heroes.module.ts              # Composition root: liga o contrato à implementação
test/
├── support/             # Factory de heróis e repositório em memória (dublê de testes)
└── heroes/              # Testes de integração: repositório e todas as rotas HTTP
```

- O **domínio** não conhece NestJS nem TypeORM. O repositório é uma classe abstrata (`HeroRepository`) que serve ao mesmo tempo de contrato e de token de injeção.
- Os **casos de uso** recebem o repositório pelo construtor e também não dependem do framework. O `HeroesModule` os instancia via `useFactory`.
- A **implementação** (`TypeOrmHeroRepository`) é a única peça que fala com o banco, traduzindo com o `HeroMapper`.
- A **apresentação** traduz HTTP ⇄ domínio: DTOs validam a entrada (`snake_case`, como o contrato), o `HeroPresenter` monta a resposta e o `GlobalExceptionFilter` converte erros de domínio em status HTTP pelo **tipo** do erro (não encontrado → 404, conflito → 409, regra violada → 422). O domínio nunca conhece status HTTP.

## Testes

- **Unitários** (`*.spec.ts`, ao lado do código): domínio e casos de uso usam o `InMemoryHeroRepository`, então rodam sem banco e em milissegundos.
- **Integração** (`test/**/*.e2e-spec.ts`): rodam contra o MySQL real, no banco `hero_forge_test`. Os testes fixam o fuso `America/Sao_Paulo` para garantir que datas não "voltam um dia" fora do UTC.
