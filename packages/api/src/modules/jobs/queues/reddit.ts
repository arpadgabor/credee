import { useReddit } from '@credee/shared/reddit/queue'
import { config } from '../../../config.js'

const Reddit = useReddit({
  redisConnection: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
  },
})

export { Reddit }
