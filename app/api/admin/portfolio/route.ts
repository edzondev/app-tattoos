import { asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { portfolioItem } from '@/lib/db/schema'
import { withAdmin } from '@/lib/with-admin'
import { PortfolioItemSchema } from '@/modules/schemas/portfolio'

export const GET = withAdmin(async () => {
  const items = await db.query.portfolioItem.findMany({
    orderBy: asc(portfolioItem.sortOrder),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.sortOrder)],
      },
    },
  })

  return NextResponse.json(items)
})

export const POST = withAdmin(async (req) => {
  const json = await req.json().catch(() => null)
  const parsed = PortfolioItemSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    )
  }

  const [item] = await db
    .insert(portfolioItem)
    .values({
      title: parsed.data.title,
      style: parsed.data.style,
      bodyZone: parsed.data.bodyZone || null,
      colorMode: parsed.data.colorMode,
      description: parsed.data.description || null,
      isPublished: parsed.data.isPublished,
      sortOrder: parsed.data.sortOrder,
    })
    .returning()

  revalidatePath('/')

  return NextResponse.json({ ...item, images: [] }, { status: 201 })
})
