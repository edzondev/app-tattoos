import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { buildPreviewGenerationStatus } from '@/lib/config/preview-generation'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { previewGenerationLimit } from '@/lib/env'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const maxGenerations = previewGenerationLimit()

  const row = await db.query.tattooRequest.findFirst({
    where: eq(tattooRequest.id, id),
    columns: { generationCount: true },
  })

  if (!row) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json(
    buildPreviewGenerationStatus(row.generationCount, maxGenerations),
  )
}
