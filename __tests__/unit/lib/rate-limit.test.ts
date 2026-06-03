import { describe, expect, it } from 'vitest'
import { getClientIp } from '@/lib/get-client-ip'
import { resolveRateLimitUpdate } from '@/lib/rate-limit'

describe('getClientIp', () => {
  it('uses the first x-forwarded-for address', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.10, 10.0.0.1',
    })

    expect(getClientIp(headers)).toBe('203.0.113.10')
  })

  it('falls back to x-real-ip', () => {
    const headers = new Headers({ 'x-real-ip': '198.51.100.7' })

    expect(getClientIp(headers)).toBe('198.51.100.7')
  })
})

describe('resolveRateLimitUpdate', () => {
  const now = new Date('2026-06-02T22:00:00.000Z')

  it('allows and starts a new window when no row exists', () => {
    expect(
      resolveRateLimitUpdate({
        row: null,
        now,
        maxAttempts: 2,
        windowMs: 60_000,
      }),
    ).toEqual({ allowed: true, attempts: 1, shouldResetWindow: true })
  })

  it('blocks when attempts exceed the window limit', () => {
    expect(
      resolveRateLimitUpdate({
        row: {
          attempts: 2,
          updatedAt: new Date('2026-06-02T21:59:30.000Z'),
        },
        now,
        maxAttempts: 2,
        windowMs: 60_000,
      }),
    ).toEqual({ allowed: false, attempts: 3, shouldResetWindow: false })
  })

  it('resets attempts after the window expires', () => {
    expect(
      resolveRateLimitUpdate({
        row: {
          attempts: 99,
          updatedAt: new Date('2026-06-02T21:58:00.000Z'),
        },
        now,
        maxAttempts: 2,
        windowMs: 60_000,
      }),
    ).toEqual({ allowed: true, attempts: 1, shouldResetWindow: true })
  })
})
