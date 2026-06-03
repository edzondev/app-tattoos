import { NextResponse } from 'next/server'
import { confirmDepositFromMercadoPagoPayment } from '@/lib/payments/confirm-deposit'
import {
  isMercadoPagoSignatureValid,
  mercadoPagoPayment,
  mercadoPagoWebhookSignatureDataId,
} from '@/lib/payments/mercadopago'

type MercadoPagoWebhookBody = {
  type?: string
  action?: string
  data?: { id?: string | number }
}

type MercadoPagoPaymentResponse = {
  id?: string | number
  status?: string
  external_reference?: string
  transaction_amount?: number
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as MercadoPagoWebhookBody
  const url = new URL(req.url)

  if (body.type && body.type !== 'payment') {
    return NextResponse.json({ received: true, ignored: true, type: body.type })
  }

  const signatureDataId = mercadoPagoWebhookSignatureDataId(url)
  const paymentId = String(body.data?.id ?? signatureDataId ?? '')

  if (!paymentId) {
    return NextResponse.json({ error: 'missing_payment_id' }, { status: 400 })
  }

  const signatureValid = isMercadoPagoSignatureValid({
    dataId: signatureDataId,
    requestId: req.headers.get('x-request-id'),
    signature: req.headers.get('x-signature'),
  })

  if (!signatureValid) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  const payment = (await mercadoPagoPayment().get({
    id: paymentId,
  })) as MercadoPagoPaymentResponse

  const result = await confirmDepositFromMercadoPagoPayment(payment)

  if (result.status === 'missing_reference') {
    return NextResponse.json({ error: 'missing_reference' }, { status: 422 })
  }

  if (result.status === 'request_not_found') {
    return NextResponse.json({ error: 'request_not_found' }, { status: 404 })
  }

  return NextResponse.json({ received: true, ...result })
}
