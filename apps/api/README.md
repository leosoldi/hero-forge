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

Os testes de integração usam o banco `hero_forge_test`, isolado do banco de desenvolvimento.

## Endpoints

| Método | Rota      | Descrição                                |
| ------ | --------- | ---------------------------------------- |
| `GET`  | `/health` | Verifica se a API e o banco estão no ar  |
