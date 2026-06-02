import { and, eq, lt, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { generateImages } from '@/lib/ai/generate-image'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { buildTattooPrompt } from '@/lib/prompts/tattoo-prompt'
import {
  RefineSchema,
  Step1Schema,
  Step2Schema,
} from '@/modules/schemas/tattoo'

const GENERATION_LIMIT = 2

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [{ id }, json] = await Promise.all([
    params,
    req.json().catch(() => ({})),
  ])
  const bodyResult = RefineSchema.safeParse(json)
  if (!bodyResult.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  // Atomically increment the generationCount if it is less than the limit
  const updated = await db
    .update(tattooRequest)
    .set({
      generationCount: sql`${tattooRequest.generationCount} + 1`,
    })
    .where(
      and(
        eq(tattooRequest.id, id),
        lt(tattooRequest.generationCount, GENERATION_LIMIT),
      ),
    )
    .returning()

  if (updated.length === 0) {
    const exists = await db.query.tattooRequest.findFirst({
      where: eq(tattooRequest.id, id),
      columns: { id: true },
    })

    if (!exists) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        error: 'generation_limit_reached',
        message:
          'Alcanzaste el límite de 2 diseños para esta solicitud. Escríbenos por WhatsApp para continuar.',
      },
      { status: 403 },
    )
  }

  const tr = updated[0]

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
    const base64 = Buffer.from(uint8).toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    return NextResponse.json({ dataUrl, mimeType: 'image/png' })
  } catch (err: unknown) {
    // Rollback the generationCount increment on failure
    await db
      .update(tattooRequest)
      .set({
        generationCount: sql`GREATEST(0, ${tattooRequest.generationCount} - 1)`,
      })
      .where(eq(tattooRequest.id, id))

    const message = err instanceof Error ? err.message : 'unknown'
    console.error('[generate-preview] AI generation failed:', message)
    return NextResponse.json({ error: 'generation_failed' }, { status: 500 })
  }
}
