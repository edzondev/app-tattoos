import { describe, expect, it } from 'vitest'
import { parseMercadoPagoReturnSearchParams } from '@/lib/payments/mp-return-search-params'

describe('parseMercadoPagoReturnSearchParams', () => {
  it('reads Mercado Pago return query params from Next.js searchParams', () => {
    expect(
      parseMercadoPagoReturnSearchParams({
        payment_id: '161451066457',
        status: 'approved',
        collection_status: 'approved',
        external_reference: 'req-1',
      }),
    ).toEqual({
      payment_id: '161451066457',
      collection_id: undefined,
      status: 'approved',
      collection_status: 'approved',
      external_reference: 'req-1',
    })
  })

  it('uses the first value when Next.js provides string[]', () => {
    expect(
      parseMercadoPagoReturnSearchParams({
        payment_id: ['161451066457', 'ignored'],
      }).payment_id,
    ).toBe('161451066457')
  })
})
