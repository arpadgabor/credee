import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { fastify } from 'fastify'
import { migrateToLatest } from '@credee/shared/database'
import { config } from './config'
import { appRouter } from './router'
import { serverLogging } from './core/logger'

const server = fastify({
  maxParamLength: 5000,
  logger: serverLogging.development,
})

server.register(cors, {
  allowedHeaders: '*',
  origin: '*',
})

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    onError: (ctx: any) => {
      console.log(ctx?.error?.cause)
    },
  },
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
