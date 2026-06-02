import { PutObjectCommand } from '@aws-sdk/client-s3'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { db } from '@/lib/db'
import { portfolioImage, portfolioItem } from '@/lib/db/schema'
import { requiredEnv } from '@/lib/env'
import { r2Client } from '@/lib/r2/presigned'
import { buildR2PublicUrl } from '@/lib/r2/public-url'
import { withAdmin } from '@/lib/with-admin'

export const POST = withAdmin(async (req) => {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const itemId = formData.get('itemId') as string | null

  if (!file || !itemId) {
    return NextResponse.json(
      { error: 'file and itemId are required' },
      { status: 400 },
    )
  }

  const exists = await db.query.portfolioItem.findFirst({
    where: eq(portfolioItem.id, itemId),
    columns: { id: true },
  })

  if (!exists) {
    return NextResponse.json(
      { error: 'PortfolioItem not found' },
      { status: 404 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const webpBuffer = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  const imageId = crypto.randomUUID()
  const r2Key = `portfolio/${itemId}/${imageId}.webp`

  const client = r2Client()
  await client.send(
    new PutObjectCommand({
      Bucket: requiredEnv('R2_BUCKET'),
      Key: r2Key,
      Body: webpBuffer,
      ContentType: 'image/webp',
    }),
  )

  const publicUrl = buildR2PublicUrl(r2Key)

  const [image] = await db
    .insert(portfolioImage)
    .values({
      itemId,
      r2Key,
      publicUrl,
      mimeType: 'image/webp',
      sizeBytes: webpBuffer.length,
    })
    .returning()

  revalidatePath('/')

  return NextResponse.json(image, { status: 201 })
})
