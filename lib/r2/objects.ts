import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { requiredEnv } from '@/lib/env'
import { r2Client } from './presigned'

export async function putR2Object(params: {
  key: string
  body: Buffer | Uint8Array
  contentType: string
}): Promise<void> {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: requiredEnv('R2_BUCKET'),
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    }),
  )
}

export async function getR2Object(key: string): Promise<{
  body: Uint8Array
  contentType: string
}> {
  const result = await r2Client().send(
    new GetObjectCommand({
      Bucket: requiredEnv('R2_BUCKET'),
      Key: key,
    }),
  )

  if (!result.Body) {
    throw new Error(`R2 object has no body: ${key}`)
  }

  const body = await result.Body.transformToByteArray()
  return {
    body,
    contentType: result.ContentType ?? 'application/octet-stream',
  }
}
