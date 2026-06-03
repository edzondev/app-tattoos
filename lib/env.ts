export const PREVIEW_GENERATION_LIMIT_DEFAULT = 2
export const PREVIEW_GENERATION_LIMIT_MAX = 2

/** Max AI preview designs per tattoo request. Clamped to [1, PREVIEW_GENERATION_LIMIT_MAX]. */
export function previewGenerationLimit(): number {
  const raw = process.env.PREVIEW_GENERATION_LIMIT?.trim()
  if (!raw) {
    return PREVIEW_GENERATION_LIMIT_DEFAULT
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return PREVIEW_GENERATION_LIMIT_DEFAULT
  }

  return Math.min(parsed, PREVIEW_GENERATION_LIMIT_MAX)
}

export function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function appUrl(): string {
  return requiredEnv('APP_URL').replace(/\/+$/, '')
}

export function mercadoPagoAccessToken(): string {
  return requiredEnv('MP_ACCESS_TOKEN')
}

export function mercadoPagoWebhookSecret(): string {
  return requiredEnv('MP_WEBHOOK_SECRET')
}

/** When true, Checkout Pro uses sandbox_init_point. Required if test creds use APP_USR-. */
export function isMercadoPagoSandboxMode(): boolean {
  const value = process.env.MP_SANDBOX?.trim().toLowerCase()
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return process.env.NODE_ENV !== 'production'
}
