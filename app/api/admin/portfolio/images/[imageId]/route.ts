import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { portfolioImage } from '@/lib/db/schema'
import { requiredEnv } from '@/lib/env'
import { r2Client } from '@/lib/r2/presigned'
import { withAdmin } from '@/lib/with-admin'

export const DELETE = withAdmin<{ imageId: string }>(
  async (_req, { params }) => {
    const { imageId } = await params

    const image = await db.query.portfolioImage.findFirst({
      where: eq(portfolioImage.id, imageId),
      columns: { id: true, r2Key: true },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const client = r2Client()
    await client
      .send(
        new DeleteObjectCommand({
          Bucket: requiredEnv('R2_BUCKET'),
          Key: image.r2Key,
        }),
      )
      .catch(() => {})

    await db.delete(portfolioImage).where(eq(portfolioImage.id, imageId))

    revalidatePath('/')

    return NextResponse.json({ ok: true })
  },
)
