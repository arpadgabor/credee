# REMOVE UNUSED PACKAGES
FROM node:16.19 as init

RUN npm i -g pnpm@7.24.3
RUN npm i -g turbo@1.7

WORKDIR /app
COPY . .

RUN turbo prune --scope=@credee/api --docker

# INSTALLER
FROM node:16.19 AS installer

RUN npm i -g pnpm@7.24.3
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=init /app/out/json/ ./
COPY --from=init /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

COPY --from=init /app/out/full/ ./
COPY turbo.json turbo.json
RUN pnpm run build

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE $PORT

WORKDIR /app/packages/api

CMD node dist/server.js