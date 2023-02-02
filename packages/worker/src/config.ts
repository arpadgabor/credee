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
  s3: {
    bucket: {
      env: 'S3_BUCKET_NAME',
      format: String,
      nullable: true,
      default: undefined,
    },
    publicUrl: {
      env: 'S3_PUBLIC_URL',
      format: String,
      nullable: true,
      default: undefined,
    },
    endpoint: {
      env: 'S3_ENDPOINT',
      format: String,
      nullable: true,
      default: undefined,
    },
    accessKeyId: {
      env: 'S3_ACCESS_KEY_ID',
      format: String,
      nullable: true,
      default: undefined,
    },
    secretAccessKey: {
      env: 'S3_SECRET_ACCESS_KEY',
      format: String,
      nullable: true,
      default: undefined,
    },
  },
})
