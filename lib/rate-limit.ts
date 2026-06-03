import { eq } from 'drizzle-orm'
import { rateLimit } from '@/lib/db/schema'

type RateLimitRow = {
  attempts: number
  updatedAt: Date
}

type ResolveRateLimitInput = {
  row: RateLimitRow | null
  now: Date
  maxAttempts: number
  windowMs: number
}

export type RateLimitDecision = {
  allowed: boolean
  attempts: number
  shouldResetWindow: boolean
}

export function resolveRateLimitUpdate({
  row,
  now,
  maxAttempts,
  windowMs,
}: ResolveRateLimitInput): RateLimitDecision {
  if (!row) {
    return { allowed: true, attempts: 1, shouldResetWindow: true }
  }

  const windowExpired = now.getTime() - row.updatedAt.getTime() >= windowMs
  if (windowExpired) {
    return { allowed: true, attempts: 1, shouldResetWindow: true }
  }

  const attempts = row.attempts + 1
  return {
    allowed: attempts <= maxAttempts,
    attempts,
    shouldResetWindow: false,
  }
}

type CheckRateLimitOptions = {
  maxAttempts: number
  windowMs: number
}

export async function checkRateLimit(
  ip: string,
  { maxAttempts, windowMs }: CheckRateLimitOptions,
): Promise<RateLimitDecision> {
  const { db } = await import('@/lib/db')
  const now = new Date()
  const existing = await db.query.rateLimit.findFirst({
    where: eq(rateLimit.ip, ip),
    columns: {
      attempts: true,
      updatedAt: true,
    },
  })

  const decision = resolveRateLimitUpdate({
    row: existing ?? null,
    now,
    maxAttempts,
    windowMs,
  })

  await db
    .insert(rateLimit)
    .values({
      ip,
      attempts: decision.attempts,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: rateLimit.ip,
      set: {
        attempts: decision.attempts,
        updatedAt: now,
      },
    })

  return decision
}
