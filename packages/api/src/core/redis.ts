import { config } from '../config.js'
import { createClient } from 'redis'

export const redis = createClient({
  url: config.get('redisUrl'),
})
