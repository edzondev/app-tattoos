import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requiredEnv } from '@/lib/env'

export function r2Client() {
  const accountId = requiredEnv('R2_ACCOUNT_ID')
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),
    },
  })
}

export async function presignPut(params: {
  key: string
  contentType: string
  expiresInSeconds?: number
}) {
  const cmd = new PutObjectCommand({
    Bucket: requiredEnv('R2_BUCKET'),
    Key: params.key,
    ContentType: params.contentType,
  })

  // Fixed: was calling r2() which doesn't exist — correct name is r2Client()
  const url = await getSignedUrl(r2Client(), cmd, {
    expiresIn: params.expiresInSeconds ?? 60,
  })
  return url
}
