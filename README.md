# Hero Forge

Plataforma de gestão de heróis: cadastre, liste, edite, desative e reative heróis com suas principais características e poderes.

> 🚧 Projeto em construção. Este README é atualizado a cada etapa.

## Stack

| Camada         | Tecnologia                                   |
| -------------- | -------------------------------------------- |
| API            | Node.js 22, NestJS, TypeORM, Jest            |
| Front-end      | React, Vite, TypeScript                      |
| Banco de dados | MySQL 8.4 (LTS) em Docker                    |

## Estrutura do repositório

```
hero-forge/
├── apps/
│   ├── api/            # API REST (NestJS)
│   └── web/            # Front-end (React + Vite)
├── docker/
│   └── mysql/init/     # Scripts executados na primeira subida do MySQL
├── docker-compose.yml
└── package.json        # npm workspaces
```

## Pré-requisitos

- [Node.js 22+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (no Windows, com WSL 2)
- Git

## Como rodar

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

### 2. Banco de dados

```bash
npm run db:up
```

Sobe o MySQL 8.4 na porta `3306` (configurável via `MYSQL_PORT`) com dois bancos:

- `hero_forge`: usado pela aplicação
- `hero_forge_test`: usado pelos testes de integração

| Script             | Descrição                                     |
| ------------------ | --------------------------------------------- |
| `npm run db:up`    | Sobe o container do MySQL                     |
| `npm run db:down`  | Para o container                              |
| `npm run db:logs`  | Acompanha os logs do MySQL                    |
| `npm run db:reset` | Apaga o volume e recria o banco do zero       |

## Roadmap

- [x] Estrutura do monorepo e banco de dados em Docker
- [ ] API: setup, domínio, casos de uso e persistência
- [ ] API: endpoints REST, validação e tratamento de erros
- [ ] API: documentação (Swagger) e testes
- [ ] Front-end: listagem, busca, paginação e modais
- [ ] Dockerização completa
- [ ] Extra: geração de avatar e contexto do herói com IA
