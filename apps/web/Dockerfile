# Contexto de build: raiz do monorepo (por causa do package-lock.json dos workspaces).
# docker build -f apps/web/Dockerfile .

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --workspace apps/web

COPY apps/web apps/web
RUN npm run build --workspace apps/web

# Servidor estático: entrega o build do Vite e repassa /api e /uploads para a API
FROM nginx:1.28-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
