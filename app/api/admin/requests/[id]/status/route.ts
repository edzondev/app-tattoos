import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { withAdmin } from '@/lib/with-admin'
import { AdminStatusSchema } from '@/modules/schemas/admin'

const VALID_TRANSITIONS: Record<string, string[]> = {
  '': ['SENT', 'EXPIRED'],
  SENT: ['QUOTED', 'EXPIRED'],
  QUOTED: ['APPOINTMENT_CONFIRMED', 'EXPIRED'],
  APPOINTMENT_CONFIRMED: ['FINISHED', 'EXPIRED'],
}

export const POST = withAdmin<{ id: string }>(async (req, { params }) => {
  const [{ id }, json] = await Promise.all([
    params,
    req.json().catch(() => null),
  ])
  const parsed = AdminStatusSchema.safeParse(json)

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

  const current = tr.status ?? ''
  const allowed = VALID_TRANSITIONS[current] ?? []
  const target = parsed.data.status

  if (target === current) {
    const row = await db.query.tattooRequest.findFirst({
      where: eq(tattooRequest.id, id),
      columns: {
        id: true,
        status: true,
        quotedAt: true,
        depositConfirmedAt: true,
        appointmentAt: true,
        finishedAt: true,
        expiredAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(row)
  }

  if (!allowed.includes(target)) {
    return NextResponse.json(
      {
        error: 'invalid_transition',
        current: tr.status,
        target,
        allowed,
      },
      { status: 409 },
    )
  }

  const now = new Date()
  const timestampMap: Record<string, Record<string, Date | null>> = {
    SENT: { sentAt: now },
    QUOTED: { quotedAt: now },
    APPOINTMENT_CONFIRMED: {
      depositConfirmedAt: now,
      appointmentAt: parsed.data.appointmentAt
        ? new Date(parsed.data.appointmentAt)
        : now,
    },
    FINISHED: { finishedAt: now },
    EXPIRED: { expiredAt: now },
  }

  const [updated] = await db
    .update(tattooRequest)
    .set({
      status: target as
        | 'SENT'
        | 'QUOTED'
        | 'APPOINTMENT_CONFIRMED'
        | 'FINISHED'
        | 'EXPIRED',
      ...timestampMap[target],
    })
    .where(eq(tattooRequest.id, id))
    .returning({
      id: tattooRequest.id,
      status: tattooRequest.status,
      quotedAt: tattooRequest.quotedAt,
      depositConfirmedAt: tattooRequest.depositConfirmedAt,
      appointmentAt: tattooRequest.appointmentAt,
      finishedAt: tattooRequest.finishedAt,
      expiredAt: tattooRequest.expiredAt,
      updatedAt: tattooRequest.updatedAt,
    })

  return NextResponse.json(updated)
})
