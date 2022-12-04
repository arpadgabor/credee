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
  database: {
    host: {
      format: String,
      env: 'DB_HOST',
      default: 'credee',
    },
    port: {
      format: 'port',
      env: 'DB_PORT',
      default: 5432,
    },
    name: {
      format: String,
      env: 'DB_NAME',
      default: 'credee',
    },
    user: {
      format: String,
      env: 'DB_USER',
      default: 'credee',
    },
    pass: {
      format: String,
      env: 'DB_PASS',
      default: 'credee',
    },
  },
})
