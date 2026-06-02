import { asc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { portfolioItem } from '@/lib/db/schema'

export async function GET() {
  const items = await db.query.portfolioItem.findMany({
    where: eq(portfolioItem.isPublished, true),
    orderBy: asc(portfolioItem.sortOrder),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.sortOrder)],
      },
    },
  })

  return NextResponse.json(items)
}
