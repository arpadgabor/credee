import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { config } from '../config.js'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'

const s3 = new S3Client({
  region: 'auto',
  endpoint: config.get('s3.endpoint'),
  credentials: config.get('s3.accessKeyId')
    ? {
        accessKeyId: config.get('s3.accessKeyId'),
        secretAccessKey: config.get('s3.secretAccessKey'),
      }
    : undefined,
})

export async function uploadFile(params: { filename: string; data: Buffer | string }): Promise<string> {
  if (!config.get('s3.bucket')) {
    const filePath = resolve(process.cwd(), 'screenshots', params.filename)
    await writeFile(filePath, params.data)

    return `uploads/${params.filename}`
  }

  const command = new PutObjectCommand({
    Bucket: config.get('s3.bucket'),
    Key: params.filename,
    Body: params.data,
  })

  await s3.send(command)
  return `${config.get('s3.publicUrl')}/${params.filename}`
}
