import { createClient } from 'redis'
import { config } from './config.js'

export const redisConnection = {
  host: config.get('redis.host'),
  port: config.get('redis.port'),
}

export const redis = createClient({
  url: `redis://${config.get('redis.host')}:${config.get('redis.port')}`,
})
await redis.connect()
