import { createHmac, timingSafeEqual } from 'node:crypto'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import {
  isMercadoPagoSandboxMode,
  mercadoPagoAccessToken,
  mercadoPagoWebhookSecret,
} from '@/lib/env'

export function mercadoPagoClient(): MercadoPagoConfig {
  return new MercadoPagoConfig({
    accessToken: mercadoPagoAccessToken(),
    options: { timeout: 5000 },
  })
}

export function mercadoPagoPreference(): Preference {
  return new Preference(mercadoPagoClient())
}

export function mercadoPagoPayment(): Payment {
  return new Payment(mercadoPagoClient())
}

type MercadoPagoPreferenceUrls = {
  init_point?: string
  sandbox_init_point?: string
}

export function resolveMercadoPagoInitPoint(
  preference: MercadoPagoPreferenceUrls,
  options?: { sandbox?: boolean; accessToken?: string },
): string | undefined {
  const sandbox =
    options?.sandbox ??
    (isMercadoPagoSandboxMode() ||
      (options?.accessToken ?? mercadoPagoAccessToken()).startsWith('TEST-'))

  if (sandbox) {
    // Never fall back to init_point: with test credentials it points at www.* (production UI)
    // and triggers "Una de las partes... es de prueba" when paying with test cards.
    return preference.sandbox_init_point
  }

  return preference.init_point ?? preference.sandbox_init_point
}

export function isMercadoPagoReturnUrlAllowed(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }

  if (url.protocol !== 'https:') return false

  const hostname = url.hostname.toLowerCase()
  return !['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)
}

/** data.id from webhook query string, used only for x-signature HMAC (MP spec). */
export function mercadoPagoWebhookSignatureDataId(url: URL): string {
  const fromQuery = url.searchParams.get('data.id')
  if (!fromQuery) return ''
  return /[a-zA-Z]/.test(fromQuery) ? fromQuery.toLowerCase() : fromQuery
}

export function parseMercadoPagoSignature(signature: string | null): {
  timestamp: string
  hash: string
} | null {
  if (!signature) return null

  const parts = Object.fromEntries(
    signature.split(',').map((part) => {
      const [key, value] = part.split('=')
      return [key?.trim(), value?.trim()]
    }),
  )

  if (!parts.ts || !parts.v1) return null
  return { timestamp: parts.ts, hash: parts.v1 }
}

export function isMercadoPagoSignatureValid(params: {
  dataId: string
  requestId: string | null
  signature: string | null
  secret?: string
}): boolean {
  if (!params.requestId) return false

  const parsed = parseMercadoPagoSignature(params.signature)
  if (!parsed) return false

  const secret = params.secret ?? mercadoPagoWebhookSecret()
  const manifest = `id:${params.dataId};request-id:${params.requestId};ts:${parsed.timestamp};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  const receivedBuffer = Buffer.from(parsed.hash, 'hex')
  const expectedBuffer = Buffer.from(expected, 'hex')
  if (receivedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(receivedBuffer, expectedBuffer)
}
