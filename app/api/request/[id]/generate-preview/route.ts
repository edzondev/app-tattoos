import { and, eq, lt, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateImages } from '@/lib/ai/generate-image'
import {
  buildPreviewGenerationStatus,
  previewGenerationLimitReachedMessage,
} from '@/lib/config/preview-generation'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { previewGenerationLimit } from '@/lib/env'
import { getClientIp } from '@/lib/get-client-ip'
import {
  compressTattooPreview,
  watermarkTattooPreview,
} from '@/lib/images/watermark'
import { buildTattooPrompt } from '@/lib/prompts/tattoo-prompt'
import { putR2Object } from '@/lib/r2/objects'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  RefineSchema,
  Step1Schema,
  Step2Schema,
} from '@/modules/schemas/tattoo'

const GENERATION_IP_RATE_LIMIT = {
  maxAttempts: 10,
  windowMs: 60 * 60 * 1000,
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [{ id }, json] = await Promise.all([
    params,
    req.json().catch(() => ({})),
  ])

  const maxGenerations = previewGenerationLimit()

  const ip = getClientIp(req.headers)
  const rateLimitResult = await checkRateLimit(ip, GENERATION_IP_RATE_LIMIT)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message:
          'Alcanzaste el límite de generaciones por hora. Intenta nuevamente más tarde.',
      },
      { status: 429 },
    )
  }

  const bodyResult = RefineSchema.safeParse(json)
  if (!bodyResult.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const updated = await db
    .update(tattooRequest)
    .set({
      generationCount: sql`${tattooRequest.generationCount} + 1`,
    })
    .where(
      and(
        eq(tattooRequest.id, id),
        lt(tattooRequest.generationCount, maxGenerations),
      ),
    )
    .returning()

  if (updated.length === 0) {
    const existing = await db.query.tattooRequest.findFirst({
      where: eq(tattooRequest.id, id),
      columns: { id: true, generationCount: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const status = buildPreviewGenerationStatus(
      existing.generationCount,
      maxGenerations,
    )

    return NextResponse.json(
      {
        error: 'generation_limit_reached',
        message: previewGenerationLimitReachedMessage(maxGenerations),
        ...status,
      },
      { status: 403 },
    )
  }

  const tr = updated[0]
  const status = buildPreviewGenerationStatus(
    tr.generationCount,
    maxGenerations,
  )

  const step1 = Step1Schema.parse({
    title: tr.title ?? undefined,
    style: tr.style,
    bodyZone: tr.bodyZone,
    size: tr.size,
    sizeNotes: tr.sizeNotes ?? undefined,
    colorMode: tr.colorMode,
    detailLevel: tr.detailLevel,
  })

  const step2 = Step2Schema.parse({
    specialInstructions: tr.specialInstructions ?? undefined,
  })

  let prompt = buildTattooPrompt(step1, step2)
  const { refineText } = bodyResult.data
  if (refineText) {
    prompt += `\nRefinement instruction: ${refineText}`
  }

  try {
    const uint8 = await generateImages(prompt)
    const cleanBuffer = await compressTattooPreview(uint8)
    const watermarkedBuffer = await watermarkTattooPreview(uint8)
    const previewId = crypto.randomUUID()
    const cleanR2Key = `tattoos/requests/${id}/previews/${previewId}.webp`
    const watermarkedR2Key = `tattoos/requests/${id}/previews/${previewId}-watermarked.webp`

    await Promise.all([
      putR2Object({
        key: cleanR2Key,
        body: cleanBuffer,
        contentType: 'image/webp',
      }),
      putR2Object({
        key: watermarkedR2Key,
        body: watermarkedBuffer,
        contentType: 'image/webp',
      }),
    ])

    const base64 = watermarkedBuffer.toString('base64')
    const dataUrl = `data:image/webp;base64,${base64}`

    return NextResponse.json({
      dataUrl,
      mimeType: 'image/webp',
      r2Key: cleanR2Key,
      watermarkedR2Key,
      sizeBytes: cleanBuffer.length,
      ...status,
    })
  } catch {
    await db
      .update(tattooRequest)
      .set({
        generationCount: sql`GREATEST(0, ${tattooRequest.generationCount} - 1)`,
      })
      .where(eq(tattooRequest.id, id))

    return NextResponse.json({ error: 'generation_failed' }, { status: 500 })
  }
}
