# REMOVE UNUSED PACKAGES
FROM node:18.15 as init

RUN npm i -g pnpm@7.25.1
RUN npm i -g turbo@1.7

WORKDIR /app
COPY . .

RUN turbo prune --scope=@credee/worker --docker

# INSTALLER
FROM mcr.microsoft.com/playwright:v1.29.0-focal AS installer

RUN npm i -g pnpm@7.25.1
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=init /app/out/json/ ./
COPY --from=init /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

COPY --from=init /app/out/full/ ./
COPY turbo.json turbo.json
RUN pnpm run build

VOLUME /app/packages/worker/screenshots
WORKDIR /app/packages/worker

CMD node dist/workers.js
