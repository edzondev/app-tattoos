import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { presignPut } from '@/lib/r2/presigned'
import { PresignSelectedSchema } from '@/modules/schemas/tattoo'

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp']
const ALLOWED_EXTS = ['png', 'jpg', 'jpeg', 'webp']

/**
 * POST /api/uploads/presign-selected
 *
 * Issues a short-lived presigned PUT URL for the selected tattoo image.
 * The client uploads the blob directly to R2 — the binary never passes
 * through Vercel (critical for Vercel's request-body size limits).
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = PresignSelectedSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    )
  }

  const { requestId, mimeType, ext } = parsed.data

  // Validate file type and extension
  if (
    !ALLOWED_MIMES.includes(mimeType) ||
    !ALLOWED_EXTS.includes(ext.toLowerCase())
  ) {
    return NextResponse.json({ error: 'invalid_file_type' }, { status: 400 })
  }

  // Verify requestId exists in database
  const exists = await db.query.tattooRequest.findFirst({
    where: eq(tattooRequest.id, requestId),
    columns: { id: true },
  })

  if (!exists) {
    return NextResponse.json({ error: 'request_not_found' }, { status: 404 })
  }

  // Key pattern: tattoos/requests/<id>/selected/<uuid>.<ext>
  const r2Key = `tattoos/requests/${requestId}/selected/${crypto.randomUUID()}.${ext.toLowerCase()}`

  const uploadUrl = await presignPut({
    key: r2Key,
    contentType: mimeType,
    expiresInSeconds: 120, // 2 min
  })

  return NextResponse.json({ uploadUrl, r2Key })
}
