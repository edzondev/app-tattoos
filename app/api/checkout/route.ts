import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { appUrl, isMercadoPagoSandboxMode } from '@/lib/env'
import {
  isMercadoPagoReturnUrlAllowed,
  mercadoPagoPreference,
  resolveMercadoPagoInitPoint,
} from '@/lib/payments/mercadopago'

const CheckoutSchema = z
  .object({
    requestId: z.string().min(1).optional(),
    requestCode: z.string().min(1).optional(),
  })
  .refine((value) => value.requestId || value.requestCode, {
    message: 'requestId or requestCode is required',
  })

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = CheckoutSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { requestId, requestCode } = parsed.data
  const tr = await db.query.tattooRequest.findFirst({
    where: requestId
      ? eq(tattooRequest.id, requestId)
      : eq(tattooRequest.requestCode, requestCode ?? ''),
    columns: {
      id: true,
      requestCode: true,
      status: true,
      fullName: true,
      currency: true,
      depositCents: true,
      mpPreferenceId: true,
    },
  })

  if (!tr) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  if (tr.status !== 'QUOTED') {
    return NextResponse.json(
      { error: 'invalid_status', current: tr.status },
      { status: 409 },
    )
  }

  if (!tr.depositCents || !tr.requestCode) {
    return NextResponse.json({ error: 'missing_deposit' }, { status: 422 })
  }

  const baseUrl = appUrl()
  if (!isMercadoPagoReturnUrlAllowed(baseUrl)) {
    return NextResponse.json(
      {
        error: 'invalid_app_url',
        message:
          'Mercado Pago requiere un APP_URL público con HTTPS para back_urls. Usa un dominio real o ngrok; localhost/127.0.0.1 no funcionan con auto_return.',
      },
      { status: 422 },
    )
  }

  const trackingUrl = `${baseUrl}/seguimiento/${tr.requestCode}`
  const preference = await mercadoPagoPreference().create({
    body: {
      items: [
        {
          id: tr.id,
          title: `Adelanto de cita ${tr.requestCode}`,
          quantity: 1,
          unit_price: tr.depositCents / 100,
          currency_id: tr.currency,
        },
      ],
      payer: tr.fullName ? { name: tr.fullName } : undefined,
      external_reference: tr.id,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: trackingUrl,
        failure: trackingUrl,
        pending: trackingUrl,
      },
      auto_return: 'approved',
    },
  })

  await db
    .update(tattooRequest)
    .set({
      mpPreferenceId: preference.id ?? null,
      paymentStatus: 'preference_created',
    })
    .where(eq(tattooRequest.id, tr.id))

  const initPoint = resolveMercadoPagoInitPoint(preference)
  if (!initPoint) {
    return NextResponse.json({ error: 'missing_init_point' }, { status: 502 })
  }

  const sandbox = isMercadoPagoSandboxMode()
  let initPointHost: string | undefined
  try {
    initPointHost = new URL(initPoint).hostname
  } catch {
    initPointHost = undefined
  }

  return NextResponse.json({
    preferenceId: preference.id,
    initPoint,
    sandbox,
    initPointHost,
  })
}
