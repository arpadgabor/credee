import { fastify } from 'fastify'
import cors from '@fastify/cors'

import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter } from './router.js'
import { config } from './config.js'
import { migrateToLatest } from './database/migrations.js'

const server = fastify({
  maxParamLength: 5000,
  logger: true,
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
