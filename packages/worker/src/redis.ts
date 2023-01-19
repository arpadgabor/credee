import { config } from './config.js'

export const redisConnection = {
  host: config.get('redis.host'),
  port: config.get('redis.port'),
}
