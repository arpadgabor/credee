import convict from 'convict'
import dotenv from 'dotenv'
dotenv.config()

export const config = convict({
  env: {
    env: 'NODE_ENV',
    default: 'development',
    format: ['development', 'production'],
  },
  redis: {
    host: {
      env: 'REDIS_HOST',
      format: String,
      nullable: false,
      default: '127.0.0.1',
    },
    port: {
      env: 'REDIS_PORT',
      format: Number,
      nullable: true,
      default: 6379,
    },
  },
})
