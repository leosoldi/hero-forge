# Contexto de build: raiz do monorepo (por causa do package-lock.json dos workspaces).
# docker build -f apps/api/Dockerfile .

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Dependências completas, usadas só para compilar
FROM base AS build
RUN npm ci --workspace apps/api
COPY apps/api apps/api
RUN npm run build --workspace apps/api

# Apenas dependências de produção, para a imagem final ficar enxuta
FROM base AS prod-deps
RUN npm ci --workspace apps/api --omit=dev && npm cache clean --force

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=prod-deps --chown=node:node /app ./
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
# Dados de exemplo opcionais (node dist/database/seeds/run-seed.js)
COPY --from=build --chown=node:node /app/apps/api/seed ./apps/api/seed

WORKDIR /app/apps/api
# Criada pelo usuário da aplicação para que o volume de uploads herde a permissão de escrita
RUN mkdir -p storage/uploads && chown -R node:node storage

USER node
EXPOSE 3333
CMD ["node", "dist/main.js"]
