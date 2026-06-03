import { describe, expect, it } from 'vitest'
import {
  adminCentsToDisplayValue,
  adminDisplayValueToCents,
  centsToSoles,
  formatSolesFromCents,
  solesToCents,
} from '@/lib/money'

describe('centsToSoles', () => {
  it('converts cents to soles', () => {
    expect(centsToSoles(50000)).toBe(500)
    expect(centsToSoles(15050)).toBe(150.5)
  })
})

describe('solesToCents', () => {
  it('converts whole soles to cents', () => {
    expect(solesToCents(500)).toBe(50000)
    expect(solesToCents(150)).toBe(15000)
  })

  it('rounds fractional soles to nearest cent', () => {
    expect(solesToCents(150.5)).toBe(15050)
  })
})

describe('admin quote form conversion', () => {
  it('shows soles in the input when DB has cents', () => {
    expect(adminCentsToDisplayValue(50000)).toBe(500)
    expect(adminCentsToDisplayValue(15000)).toBe(150)
  })

  it('shows empty input when there is no quote yet', () => {
    expect(adminCentsToDisplayValue(null)).toBe('')
    expect(adminCentsToDisplayValue(undefined)).toBe('')
  })

  it('stores cents when admin enters soles', () => {
    expect(adminDisplayValueToCents('500')).toBe(50000)
    expect(adminDisplayValueToCents('150')).toBe(15000)
  })

  it('clears form state when input is emptied', () => {
    expect(adminDisplayValueToCents('')).toBeUndefined()
  })

  it('round-trips a typical tattoo price', () => {
    const storedCents = 50000
    const shownSoles = adminCentsToDisplayValue(storedCents)
    expect(adminDisplayValueToCents(String(shownSoles))).toBe(storedCents)
  })
})

describe('formatSolesFromCents', () => {
  it('formats whole soles without decimals', () => {
    expect(formatSolesFromCents(50000)).toBe('S/ 500')
  })

  it('returns dash for nullish values', () => {
    expect(formatSolesFromCents(null)).toBe('—')
    expect(formatSolesFromCents(undefined)).toBe('—')
  })
})
