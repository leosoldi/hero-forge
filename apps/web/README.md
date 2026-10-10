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
        ├── components/  # Card, avatar, grid, busca, paginação e skeleton
        ├── lib/         # Cores por universo, faixa de resultados e mensagens de erro
        ├── pages/       # Tela de listagem
        └── types.ts     # Tipos do contrato da API
test/                    # Setup do Vitest, servidor MSW, fixtures e render com providers
```

Organização **por funcionalidade**: tudo que é de heróis fica em `features/heroes`. Uma funcionalidade nova ganha a própria pasta, sem espalhar arquivos pelo projeto.

## Erros

O cliente HTTP converte qualquer erro da API em um `ApiError` com o `code` retornado pelo back-end (`HERO_INACTIVE`, `VALIDATION_ERROR`...). A mensagem exibida ao usuário é escolhida no front a partir desse código, em português. Falhas de rede viram `NETWORK_ERROR`.

## Listagem

- Grid responsivo: 5 cards por linha no desktop, 2 no celular. 10 heróis por página.
- Busca por nome ou nome de guerra com _debounce_ (350 ms): a lista atualiza enquanto o usuário digita, sem disparar uma requisição por tecla. Ao buscar, a paginação volta para a página 1.
- Heróis inativos ficam em escala de cinza, com o selo "Inativo".
- Botões de filtro "Todos", "Ativos" e "Inativos" ao lado da busca. Os dois filtros se combinam, e mudar qualquer um volta para a página 1.
- Se o avatar não carregar, o card mostra a inicial do nome de guerra com a cor do universo.
- Estados de carregamento (skeleton), atualização (lista esmaecida + loader), lista vazia, busca sem resultado e erro com "Tentar novamente".

## Sugerir herói com IA

No modal de criação, o painel "Sugerir herói com IA" aceita uma ideia opcional (ex.: "heroína do gelo que protege o Ártico") e chama `POST /api/hero-suggestions`.

- A resposta preenche o formulário (nome, nome de guerra, data de nascimento, universo, habilidade e avatar) e mostra a história gerada. Nada é salvo: o usuário revisa, ajusta e só então cria o herói.
- O ícone de informação ao lado do botão mostra, ao passar o mouse, o limite diário de gerações do provedor ativo (consultado em `GET /api/hero-suggestions/info`). No modo demonstração, avisa que não há limite.
- Durante a geração, o botão fica em _loading_. Erros (por exemplo, cota da IA esgotada) aparecem como notificação.
