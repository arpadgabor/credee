import cors from '@fastify/cors'
import { fastifyStatic } from '@fastify/static'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { fastify } from 'fastify'
import { resolve } from 'node:path'
import { config } from './config.js'
import { migrateToLatest } from './database/migrations.js'
import { appRouter } from './router.js'

const logsByEnv = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true,
      },
    },
  },
  production: true,
}

const server = fastify({
  maxParamLength: 5000,
  logger: logsByEnv[config.get('env')] || true,
})
server.register(fastifyStatic, {
  root: resolve(process.cwd(), 'uploads'),
  prefix: '/uploads/',
})

server.register(cors, {
  allowedHeaders: '*',
  origin: '*',
})

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter },
})

const start = async () => {
  await migrateToLatest()

  await server
    .listen({
      port: Number(config.get('port')),
      host: config.get('host'),
    })
    .catch((err: unknown) => {
      server.log.error(err)
      process.exit(1)
    })
}

start()
