import fastify from 'fastify'
import cors from '@fastify/cors'

import { serverLogging } from './logger'

export const server = fastify({
  maxParamLength: 5000,
  logger: serverLogging.development,
})

server.register(cors, {
  allowedHeaders: '*',
  origin: '*',
})
