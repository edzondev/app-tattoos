import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { portfolioImage, portfolioItem } from '@/lib/db/schema'
import { requiredEnv } from '@/lib/env'
import { r2Client } from '@/lib/r2/presigned'
import { withAdmin } from '@/lib/with-admin'
import { PortfolioItemSchema } from '@/modules/schemas/portfolio'

export const PUT = withAdmin<{ id: string }>(async (req, { params }) => {
  const [{ id }, json] = await Promise.all([
    params,
    req.json().catch(() => null),
  ])
  const parsed = PortfolioItemSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    )
  }

  const [item] = await db
    .update(portfolioItem)
    .set({
      title: parsed.data.title,
      style: parsed.data.style,
      bodyZone: parsed.data.bodyZone || null,
      colorMode: parsed.data.colorMode,
      description: parsed.data.description || null,
      isPublished: parsed.data.isPublished,
      sortOrder: parsed.data.sortOrder,
    })
    .where(eq(portfolioItem.id, id))
    .returning()

  if (!item) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const images = await db.query.portfolioImage.findMany({
    where: eq(portfolioImage.itemId, id),
    orderBy: asc(portfolioImage.sortOrder),
  })

  revalidatePath('/')

  return NextResponse.json({ ...item, images })
})

export const DELETE = withAdmin<{ id: string }>(async (_req, { params }) => {
  const { id } = await params

  const images = await db.query.portfolioImage.findMany({
    where: eq(portfolioImage.itemId, id),
    columns: { r2Key: true },
  })

  const client = r2Client()
  const bucket = requiredEnv('R2_BUCKET')

  await Promise.all(
    images.map((img) =>
      client
        .send(new DeleteObjectCommand({ Bucket: bucket, Key: img.r2Key }))
        .catch(() => {}),
    ),
  )

  await db.delete(portfolioItem).where(eq(portfolioItem.id, id))

  revalidatePath('/')

  return NextResponse.json({ ok: true })
})
