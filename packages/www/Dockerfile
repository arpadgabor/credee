# REMOVE UNUSED PACKAGES
FROM node:16.19 as init

RUN npm i -g pnpm@7.25.1
RUN npm i -g turbo@1.7

WORKDIR /app
COPY . .

RUN turbo prune --scope=@credee/www --docker

# INSTALLER
FROM node:16.19 AS installer

RUN npm i -g pnpm@7.25.1
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=init /app/out/json/ ./
COPY --from=init /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

COPY --from=init /app/out/full/ ./
COPY turbo.json turbo.json

ENV API_URL=/api
RUN pnpm run build

WORKDIR /app/packages/www

FROM nginx:alpine AS server

COPY --from=installer /app/packages/www/dist /usr/share/nginx/html
COPY --from=installer /app/packages/www/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD nginx -g "daemon off;"
