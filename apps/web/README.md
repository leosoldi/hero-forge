# Hero Forge — Web

Front-end do Hero Forge, construído com React 19, Vite, TypeScript e Mantine.

## Como rodar

Com a API rodando em `http://localhost:3333`:

```bash
npm run dev
```

A aplicação abre em `http://localhost:5173`. As chamadas para `/api/*` são repassadas pelo proxy do Vite para a API (configurável em `.env` via `API_PROXY_TARGET`), então front e API ficam na mesma origem, sem configuração de CORS ou URL fixa no build.

## Scripts

| Script             | Descrição                                  |
| ------------------ | ------------------------------------------ |
| `npm run dev`      | Servidor de desenvolvimento com hot reload |
| `npm run build`    | Checagem de tipos e build de produção      |
| `npm run preview`  | Serve o build de produção localmente       |
| `npm run lint`     | Análise estática com oxlint                |
| `npm run format`   | Formata o código com Prettier              |
| `npm test`         | Testes (Vitest + Testing Library + MSW)    |
| `npm run test:cov` | Testes com cobertura                       |

## Stack

| Biblioteca            | Papel                                                                |
| --------------------- | -------------------------------------------------------------------- |
| Mantine               | Componentes acessíveis (modal, menu, paginação, notificações) e tema |
| TanStack Query        | Cache, loading e atualização da lista após cada ação                 |
| React Hook Form + Zod | Formulários com validação tipada                                     |
| MSW                   | Simula a API nos testes, interceptando as requisições de verdade     |

## Estrutura

```
src/
├── app/                 # Providers, tema, layout
├── shared/
│   ├── api/             # Cliente HTTP, ApiError e mensagens de erro em português
│   └── ui/              # Componentes genéricos
└── features/
    └── heroes/
        ├── api/         # Chamadas à API e hooks do TanStack Query
        ├── lib/         # Mensagens de erro específicas de heróis
        ├── pages/       # Tela de listagem
        └── types.ts     # Tipos do contrato da API
test/                    # Setup do Vitest, servidor MSW e render com providers
```

Organização **por funcionalidade**: tudo que é de heróis fica em `features/heroes`. Uma funcionalidade nova ganha a própria pasta, sem espalhar arquivos pelo projeto.

## Erros

O cliente HTTP converte qualquer erro da API em um `ApiError` com o `code` retornado pelo back-end (`HERO_INACTIVE`, `VALIDATION_ERROR`...). A mensagem exibida ao usuário é escolhida no front a partir desse código, em português. Falhas de rede viram `NETWORK_ERROR`.
