import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { generateRequestCode } from '@/lib/request-code'
import { SubmitQuoteSchema } from '@/modules/schemas/tattoo'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [{ id }, json] = await Promise.all([
    params,
    req.json().catch(() => null),
  ])
  const parsed = SubmitQuoteSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const {
    district,
    availability,
    extraComments,
    r2Key,
    watermarkedR2Key,
    mimeType,
    sizeBytes,
  } = parsed.data

  const tr = await db.query.tattooRequest.findFirst({
    where: eq(tattooRequest.id, id),
    columns: {
      id: true,
      status: true,
      trackingToken: true,
      whatsappE164: true,
      fullName: true,
    },
  })

  if (!tr) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  if (tr.status === 'SENT' || tr.status === 'QUOTED') {
    return NextResponse.json({ error: 'already_submitted' }, { status: 409 })
  }

  if (!tr.whatsappE164) {
    return NextResponse.json({ error: 'whatsapp_required' }, { status: 422 })
  }

  let requestCode: string
  try {
    requestCode = await generateRequestCode(db)
  } catch {
    return NextResponse.json(
      { error: 'code_generation_failed' },
      { status: 500 },
    )
  }

  const designPath = `/api/design/${requestCode}`

  const [updated] = await db
    .update(tattooRequest)
    .set({
      requestCode,
      selectedImageR2Key: r2Key,
      selectedImageWatermarkedR2Key: watermarkedR2Key,
      selectedImagePublicUrl: designPath,
      selectedImageMimeType: mimeType,
      selectedImageSizeBytes: sizeBytes,
      district: district.trim(),
      availability: availability.trim(),
      extraComments: extraComments?.trim() ?? null,
      status: 'SENT',
      sentAt: new Date(),
    })
    .where(eq(tattooRequest.id, id))
    .returning({
      trackingToken: tattooRequest.trackingToken,
      fullName: tattooRequest.fullName,
    })

  return NextResponse.json(
    {
      requestCode,
      trackingToken: updated.trackingToken,
      fullName: updated.fullName ?? '',
      designUrl: new URL(designPath, req.url).toString(),
    },
    { status: 201 },
  )
}
