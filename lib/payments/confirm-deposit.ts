import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
export type MercadoPagoPaymentSnapshot = {
  id?: string | number
  status?: string
  external_reference?: string
}

export async function confirmDepositFromMercadoPagoPayment(
  payment: MercadoPagoPaymentSnapshot,
): Promise<{ updated: boolean; status: string }> {
  if (!payment.external_reference) {
    return { updated: false, status: 'missing_reference' }
  }

  const tr = await db.query.tattooRequest.findFirst({
    where: eq(tattooRequest.id, payment.external_reference),
    columns: {
      id: true,
      requestCode: true,
      status: true,
      depositConfirmedAt: true,
    },
  })

  if (!tr) {
    return { updated: false, status: 'request_not_found' }
  }

  const now = new Date()
  const paymentId = payment.id ? String(payment.id) : null

  if (payment.status !== 'approved') {
    await db
      .update(tattooRequest)
      .set({
        mpPaymentId: paymentId,
        paymentStatus: payment.status ?? 'unknown',
      })
      .where(eq(tattooRequest.id, tr.id))

    return { updated: true, status: payment.status ?? 'unknown' }
  }

  if (tr.depositConfirmedAt && tr.status === 'APPOINTMENT_CONFIRMED') {
    return { updated: false, status: 'already_confirmed' }
  }

  await db
    .update(tattooRequest)
    .set({
      mpPaymentId: paymentId,
      paymentStatus: 'approved',
      depositConfirmedAt: tr.depositConfirmedAt ?? now,
      status:
        tr.status === 'QUOTED' || tr.status === 'APPOINTMENT_CONFIRMED'
          ? 'APPOINTMENT_CONFIRMED'
          : tr.status,
      appointmentAt:
        tr.status === 'QUOTED' || tr.status === 'APPOINTMENT_CONFIRMED'
          ? now
          : undefined,
    })
    .where(eq(tattooRequest.id, tr.id))

  if (tr.requestCode) {
    revalidatePath(`/seguimiento/${tr.requestCode}`)
  }

  return { updated: true, status: 'approved' }
}
