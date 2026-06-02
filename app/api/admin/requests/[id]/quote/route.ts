import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { withAdmin } from '@/lib/with-admin'
import { AdminQuoteSchema } from '@/modules/schemas/admin'

export const POST = withAdmin<{ id: string }>(async (req, { params }) => {
  const [{ id }, json] = await Promise.all([
    params,
    req.json().catch(() => null),
  ])
  const parsed = AdminQuoteSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const tr = await db.query.tattooRequest.findFirst({
    where: eq(tattooRequest.id, id),
    columns: { id: true, status: true },
  })

  if (!tr) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  if (tr.status !== 'SENT' && tr.status !== 'QUOTED') {
    return NextResponse.json(
      { error: 'invalid_status', current: tr.status },
      { status: 409 },
    )
  }

  const { priceCents, depositCents, depositDueAt, currency } = parsed.data

  const [updated] = await db
    .update(tattooRequest)
    .set({
      priceCents,
      depositCents,
      depositDueAt: depositDueAt ? new Date(depositDueAt) : null,
      currency,
      status: 'QUOTED',
      quotedAt: new Date(),
    })
    .where(eq(tattooRequest.id, id))
    .returning({
      id: tattooRequest.id,
      status: tattooRequest.status,
      priceCents: tattooRequest.priceCents,
      depositCents: tattooRequest.depositCents,
      depositDueAt: tattooRequest.depositDueAt,
      currency: tattooRequest.currency,
      quotedAt: tattooRequest.quotedAt,
    })

  return NextResponse.json(updated)
})
