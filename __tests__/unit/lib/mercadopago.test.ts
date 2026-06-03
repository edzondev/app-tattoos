import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  isMercadoPagoReturnUrlAllowed,
  isMercadoPagoSignatureValid,
  mercadoPagoWebhookSignatureDataId,
  parseMercadoPagoSignature,
  resolveMercadoPagoInitPoint,
} from '@/lib/payments/mercadopago'

describe('parseMercadoPagoSignature', () => {
  it('extracts timestamp and v1 hash', () => {
    expect(parseMercadoPagoSignature('ts=1717100000,v1=abcdef')).toEqual({
      timestamp: '1717100000',
      hash: 'abcdef',
    })
  })
})

describe('isMercadoPagoSignatureValid', () => {
  it('validates Mercado Pago webhook signatures', () => {
    const timestamp = '1717100000'
    const manifest = `id:123456789;request-id:request-1;ts:${timestamp};`
    const hash = createHmac('sha256', 'secret').update(manifest).digest('hex')

    const isValid = isMercadoPagoSignatureValid({
      dataId: '123456789',
      requestId: 'request-1',
      signature: `ts=${timestamp},v1=${hash}`,
      secret: 'secret',
    })

    expect(isValid).toBe(true)
  })
})

describe('resolveMercadoPagoInitPoint', () => {
  const urls = {
    init_point:
      'https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=prod',
    sandbox_init_point:
      'https://sandbox.mercadopago.com.pe/checkout/v1/redirect?pref_id=test',
  }

  it('uses sandbox_init_point when sandbox mode is enabled', () => {
    expect(
      resolveMercadoPagoInitPoint(urls, {
        sandbox: true,
        accessToken: 'APP_USR-1234567890-abcdef',
      }),
    ).toBe(urls.sandbox_init_point)
  })

  it('uses init_point for production mode even with APP_USR tokens', () => {
    expect(
      resolveMercadoPagoInitPoint(urls, {
        sandbox: false,
        accessToken: 'APP_USR-1234567890-abcdef',
      }),
    ).toBe(urls.init_point)
  })

  it('uses sandbox_init_point for legacy TEST- tokens', () => {
    expect(
      resolveMercadoPagoInitPoint(urls, { accessToken: 'TEST-123456' }),
    ).toBe(urls.sandbox_init_point)
  })

  it('does not fall back to production init_point in sandbox mode', () => {
    expect(
      resolveMercadoPagoInitPoint(
        { init_point: urls.init_point },
        { sandbox: true },
      ),
    ).toBeUndefined()
  })
})

describe('mercadoPagoWebhookSignatureDataId', () => {
  it('reads data.id from webhook query string', () => {
    const url = new URL(
      'https://example.com/api/webhooks/mercadopago?data.id=161451066457&type=payment',
    )
    expect(mercadoPagoWebhookSignatureDataId(url)).toBe('161451066457')
  })

  it('lowercases alphanumeric data.id values for signature manifest', () => {
    const url = new URL(
      'https://example.com/api/webhooks/mercadopago?data.id=AbC123',
    )
    expect(mercadoPagoWebhookSignatureDataId(url)).toBe('abc123')
  })
})

describe('isMercadoPagoReturnUrlAllowed', () => {
  it('rejects localhost return URLs because Mercado Pago does not accept them', () => {
    expect(isMercadoPagoReturnUrlAllowed('http://localhost:3000')).toBe(false)
    expect(isMercadoPagoReturnUrlAllowed('http://127.0.0.1:3000')).toBe(false)
  })

  it('accepts public HTTPS return URLs', () => {
    expect(isMercadoPagoReturnUrlAllowed('https://demo.ngrok-free.app')).toBe(
      true,
    )
  })
})
