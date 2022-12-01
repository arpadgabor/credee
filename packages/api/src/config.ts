import convict from 'convict'

import dotenv from 'dotenv'
dotenv.config()

export const config = convict({
  env: {
    env: 'NODE_ENV',
    default: 'development',
    format: ['development', 'production'],
  },
  redisUrl: {
    env: 'REDIS_URL',
    format: String,
    nullable: false,
    default: 'redis://127.0.0.1:6379',
  },
})
