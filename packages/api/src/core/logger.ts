import { FastifyReply, FastifyRequest } from 'fastify'
import { PrettyOptions } from 'pino-pretty'
import { LoggerOptions } from 'pino'

const prettyLogger: LoggerOptions = {
  // serializers: {
  //   req(request: FastifyRequest) {
  //     return {
  //       method: request.method,
  //     }
  //   },
  //   res(reply: FastifyReply) {
  //     return {
  //       status: reply.statusCode,
  //     }
  //   },
  // },
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname,reqId,res,req',
      colorize: true,
    } as PrettyOptions,
  },
}

export const serverLogging = {
  development: prettyLogger,
  production: true,
} as const
