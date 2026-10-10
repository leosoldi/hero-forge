# Hero Forge

Plataforma de gestão de heróis: cadastre, liste, edite, desative e reative heróis com suas principais características e poderes.

> 🚧 Projeto em construção. Este README é atualizado a cada etapa.

## Stack

| Camada         | Tecnologia                                   |
| -------------- | -------------------------------------------- |
| API            | Node.js 22, NestJS 12, TypeORM 1.x, Vitest   |
| Front-end      | React 19, Vite, TypeScript, Mantine, TanStack Query, Vitest |
| Banco de dados | MySQL 8.4 (LTS) em Docker                    |
| IA generativa  | Cloudflare Workers AI (LLM Llama 3.3 70B + FLUX.1 schnell), com modo demonstração offline |

## Destaques

- **CRUD completo de heróis** seguindo REST: listagem paginada (10 por página, 5 por linha) e ordenada pelos mais recentes, busca por nome ou nome de guerra, filtro por status (todos, ativos ou inativos), exclusão lógica com reativação, e bloqueio de edição de heróis inativos.
- **Avatar por link ou upload**: a imagem enviada é validada pelos bytes do arquivo (JPEG, PNG ou WebP até 2 MB) e salva atrás de uma porta `FileStorage`, pronta para trocar o disco local por S3.
- **Sugerir herói com IA** (extra): no modal de criação, um **LLM** gera nome, nome de guerra, data de nascimento, universo, habilidade e uma história, e um **modelo de imagem** gera o avatar. O formulário é preenchido para revisão; nada é salvo sem o usuário confirmar.
  - Funciona sem chave nenhuma no **modo demonstração** (padrão), para quem avalia testar na hora.
  - Com a chave gratuita da Cloudflare, usa a IA real. O plano gratuito rende cerca de **100 sugestões por dia** (renova às 21h de Brasília); um ícone de informação ao lado do botão mostra esse limite.
  - Os provedores ficam atrás das portas `HeroIdeaGenerator` e `AvatarGenerator`: trocar de IA é criar um adapter, sem mexer em caso de uso nem no front.
- **Arquitetura em camadas** (domínio, casos de uso, infraestrutura, apresentação) com inversão de dependência, erros de domínio padronizados e documentação Swagger.
- **Testes** unitários e de integração na API (contra MySQL real) e testes de componente no front com MSW.

## Estrutura do repositório

```
hero-forge/
├── apps/
│   ├── api/            # API REST (NestJS) + Dockerfile
│   └── web/            # Front-end (React + Vite) + Dockerfile e nginx.conf
├── docker/
│   └── mysql/init/     # Scripts executados na primeira subida do MySQL
├── docker-compose.yml  # MySQL, API e front
└── package.json        # npm workspaces
```

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (no Windows, com WSL 2)
- [Node.js 22+](https://nodejs.org/), só para o modo de desenvolvimento e para rodar os testes
- Git

## Como rodar

Há dois jeitos de rodar o projeto. Use **um ou outro**, porque os dois usam a porta `3333`.

### Opção 1: tudo em Docker (mais rápido para avaliar)

```bash
cp .env.example .env
docker compose up -d --build
```

O primeiro build leva alguns minutos. Quando terminar:

| Serviço    | Endereço                         |
| ---------- | -------------------------------- |
| Aplicação  | http://localhost:8080            |
| API        | http://localhost:3333            |
| Swagger    | http://localhost:3333/docs       |
| MySQL      | `localhost:3306`                 |

A ordem de subida é controlada por _healthchecks_: a API só sobe quando o MySQL está pronto (e roda as migrations sozinha), e o front só sobe quando a API responde em `/health`. Para acompanhar: `docker compose ps` e `docker compose logs -f api web`.

Como é montado:

- **API**: build em múltiplos estágios (compila com as dependências de desenvolvimento, e a imagem final leva só o `dist` e as dependências de produção). Roda com o usuário `node`, sem privilégios de root. As imagens enviadas ficam no volume `uploads_data`.
- **Front**: o Vite gera os arquivos estáticos e o **nginx** os serve. O próprio nginx repassa `/api` e `/uploads` para a API, o mesmo contrato do proxy do Vite em desenvolvimento, então o front não precisa saber o endereço da API.
- **IA**: sem configuração, roda em modo demonstração. Se o arquivo `apps/api/.env` existir, as chaves da Cloudflare dele são reaproveitadas (veja "IA generativa" abaixo).

As portas podem ser trocadas no `.env` (`WEB_PORT`, `API_PORT` e `MYSQL_PORT`).

| Script                | Descrição                                         |
| --------------------- | ------------------------------------------------- |
| `npm run docker:up`   | Faz o build e sobe MySQL, API e front             |
| `npm run docker:ps`   | Mostra o estado e a saúde de cada container       |
| `npm run docker:logs` | Acompanha os logs da API e do front               |
| `npm run docker:down` | Para e remove os containers (os dados ficam)      |

### Opção 2: desenvolvimento (com _hot reload_)

#### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

#### 2. Banco de dados

```bash
npm run db:up
```

Sobe só o MySQL 8.4 na porta `3306` (configurável via `MYSQL_PORT`) com dois bancos:

- `hero_forge`: usado pela aplicação
- `hero_forge_test`: usado pelos testes de integração

| Script             | Descrição                                          |
| ------------------ | -------------------------------------------------- |
| `npm run db:up`    | Sobe o container do MySQL                          |
| `npm run db:down`  | Para o container do MySQL                          |
| `npm run db:logs`  | Acompanha os logs do MySQL                         |
| `npm run db:reset` | Apaga os volumes e recria o banco do zero          |

#### 3. API

```bash
npm install
cp apps/api/.env.example apps/api/.env
npm run api:dev
```

A API sobe em `http://localhost:3333` e a documentação interativa (Swagger) fica em `http://localhost:3333/docs`.

Mais detalhes (variáveis de ambiente, scripts e endpoints) em [`apps/api/README.md`](apps/api/README.md).

#### 4. Front-end

Em outro terminal, com a API rodando:

```bash
npm run web:dev
```

A aplicação abre em `http://localhost:5173`. Mais detalhes em [`apps/web/README.md`](apps/web/README.md).

### IA generativa (opcional, vale para as duas opções)

Por padrão a API roda com `AI_PROVIDER=demo`: o botão "Sugerir herói com IA" funciona offline, com sugestões e avatares gerados localmente.

Para usar a IA real, gratuita, crie uma conta na [Cloudflare](https://dash.cloudflare.com), pegue o **Account ID** e um **API Token** do Workers AI e preencha no `apps/api/.env`:

```env
AI_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=seu-account-id
CLOUDFLARE_API_TOKEN=seu-token
```

Reinicie a API (`npm run api:dev` ou `docker compose up -d api`). O passo a passo e os detalhes do endpoint estão em [`apps/api/README.md`](apps/api/README.md#sugestão-de-herói-com-ia-generativa).

## Testes

Com o MySQL rodando (`npm run db:up`):

```bash
npm run api:test       # unitários da API
npm run api:test:e2e   # integração da API contra o MySQL (banco hero_forge_test)
npm run web:test       # componentes e fluxos do front
```

## Roadmap

- [x] Estrutura do monorepo e banco de dados em Docker
- [x] API: setup (configuração validada, conexão com o banco, health check)
- [x] API: domínio do herói, entidade do banco e migration
- [x] API: repositório e casos de uso
- [x] API: endpoints REST, DTOs com validação, tratamento de erros e Swagger
- [x] API: testes unitários e de integração
- [x] Front-end: setup (tema, providers, cliente HTTP, layout)
- [x] Front-end: listagem, busca e paginação
- [x] Front-end: modais de criação (com prévia ao vivo), edição, detalhes e confirmação
- [x] Dockerização completa (MySQL, API e front com healthchecks)
- [x] Upload de imagem do avatar (link ou arquivo)
- [x] Extra: "Sugerir herói com IA" (LLM + geração de imagem, com modo demonstração offline)
- [x] Extra: limite diário da IA exibido ao lado do botão
