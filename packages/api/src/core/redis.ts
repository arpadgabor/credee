import { config } from '../config'
import { createClient } from 'redis'

export const redis = createClient({
  url: `redis://${config.get('redis.host')}:${config.get('redis.port')}`,
})

redis.connect()
