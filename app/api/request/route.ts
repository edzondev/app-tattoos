import { and, eq, isNull, notInArray, or } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { getClientIp } from '@/lib/get-client-ip'
import { checkRateLimit } from '@/lib/rate-limit'
import { CreateRequestSchema } from '@/modules/schemas/tattoo'

const REQUEST_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000,
}

function normalizeWhatsapp(raw: string): string {
  return raw.replace(/[\s\-().]/g, '')
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  const rateLimitResult = await checkRateLimit(ip, REQUEST_RATE_LIMIT)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message:
          'Alcanzaste el límite de solicitudes por hora. Intenta nuevamente más tarde.',
      },
      { status: 429 },
    )
  }

  const json = await req.json().catch(() => null)
  const parsed = CreateRequestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { fullName, whatsapp, ...step1 } = parsed.data
  const whatsappE164 = normalizeWhatsapp(whatsapp)

  // Buscar request activo con ese WhatsApp (status distinto de FINISHED/EXPIRED o status es null)
  const existing = await db.query.tattooRequest.findFirst({
    where: and(
      eq(tattooRequest.whatsappE164, whatsappE164),
      or(
        isNull(tattooRequest.status),
        notInArray(tattooRequest.status, ['FINISHED', 'EXPIRED']),
      ),
    ),
    columns: { id: true, trackingToken: true },
  })

  if (existing) {
    // Actualizar datos del Step1 y continuar con el request existente
    await db
      .update(tattooRequest)
      .set({
        ...step1,
        fullName: fullName.trim(),
      })
      .where(eq(tattooRequest.id, existing.id))

    return NextResponse.json({
      id: existing.id,
      trackingToken: existing.trackingToken,
      isExisting: true,
    })
  }

  const now = new Date()
  const [r] = await db
    .insert(tattooRequest)
    .values({
      ...step1,
      fullName: fullName.trim(),
      whatsappE164,
      createdAt: now,
      updatedAt: now,
    })
    .returning({
      id: tattooRequest.id,
      trackingToken: tattooRequest.trackingToken,
    })

  return NextResponse.json(
    { id: r.id, trackingToken: r.trackingToken, isExisting: false },
    { status: 201 },
  )
}
