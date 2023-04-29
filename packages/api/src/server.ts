import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { migrateToLatest } from '@credee/shared/database'
import { config } from './config'
import { appRouter } from './router'
import { server } from './core/fastify'

import './modules/survey/export.controller'

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    onError: (ctx: any) => {
      console.log(ctx?.error?.cause)
    },
  },
})

server.get('/survey/:id/export', async (req, reply) => {})

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
