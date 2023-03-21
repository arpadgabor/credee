import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { unlink } from 'fs/promises'
import { resolve } from 'path'
import { config } from '../config'

const s3 = new S3Client({
  region: 'auto',
  endpoint: config.get('s3.endpoint'),
  credentials: config.get('s3.accessKeyId')
    ? {
        accessKeyId: config.get('s3.accessKeyId')!,
        secretAccessKey: config.get('s3.secretAccessKey')!,
      }
    : undefined,
})

export async function deleteFile(path?: string) {
  if (!path) return

  console.log(`Deleting image: ${path}`)

  if (!config.get('s3.bucket')) {
    const filePath = resolve(process.cwd(), path)
    await unlink(filePath)
  }

  const key = path.replace(`${config.get('s3.publicUrl')}/`, '')

  const command = new DeleteObjectCommand({
    Bucket: config.get('s3.bucket'),
    Key: key,
  })

  await s3.send(command)
}
