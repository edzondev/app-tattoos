import { confirmDepositFromMercadoPagoPayment } from '@/lib/payments/confirm-deposit'
import { mercadoPagoPayment } from '@/lib/payments/mercadopago'
import type { MercadoPagoReturnSearchParams } from '@/lib/payments/mp-return-search-params'

type MercadoPagoPaymentResponse = {
  id?: string | number
  status?: string
  external_reference?: string
}

export function hasMercadoPagoReturnParams(
  searchParams: MercadoPagoReturnSearchParams,
): boolean {
  const paymentId = searchParams.payment_id ?? searchParams.collection_id
  const returnStatus = searchParams.status ?? searchParams.collection_status
  return Boolean(paymentId && returnStatus === 'approved')
}

export async function syncDepositFromReturnUrl(params: {
  requestId: string
  currentStatus: string
  searchParams: MercadoPagoReturnSearchParams
}): Promise<{ processed: boolean; updated: boolean }> {
  if (!hasMercadoPagoReturnParams(params.searchParams)) {
    return { processed: false, updated: false }
  }

  if (params.currentStatus !== 'QUOTED') {
    return { processed: true, updated: false }
  }

  const paymentId =
    params.searchParams.payment_id ?? params.searchParams.collection_id
  if (!paymentId) {
    return { processed: false, updated: false }
  }

  const payment = (await mercadoPagoPayment().get({
    id: paymentId,
  })) as MercadoPagoPaymentResponse

  if (payment.external_reference !== params.requestId) {
    return { processed: false, updated: false }
  }
  if (payment.status !== 'approved') {
    return { processed: true, updated: false }
  }

  const result = await confirmDepositFromMercadoPagoPayment(payment)
  return { processed: true, updated: result.updated }
}
