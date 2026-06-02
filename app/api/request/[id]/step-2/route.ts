import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { Step2Schema } from '@/modules/schemas/tattoo'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [{ id }, body] = await Promise.all([params, req.json()])
  const parsed = Step2Schema.safeParse(body)

  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  const [updated] = await db
    .update(tattooRequest)
    .set({
      specialInstructions: parsed.data.specialInstructions,
    })
    .where(eq(tattooRequest.id, id))
    .returning({ id: tattooRequest.id, status: tattooRequest.status })

  if (!updated) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}
