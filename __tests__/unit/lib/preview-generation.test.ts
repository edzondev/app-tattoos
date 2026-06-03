import { afterEach, describe, expect, it } from 'vitest'
import {
  buildPreviewGenerationStatus,
  previewGenerationLimitReachedMessage,
} from '@/lib/config/preview-generation'
import {
  PREVIEW_GENERATION_LIMIT_DEFAULT,
  previewGenerationLimit,
} from '@/lib/env'

describe('previewGenerationLimit', () => {
  const original = process.env.PREVIEW_GENERATION_LIMIT

  afterEach(() => {
    if (original === undefined) {
      delete process.env.PREVIEW_GENERATION_LIMIT
    } else {
      process.env.PREVIEW_GENERATION_LIMIT = original
    }
  })

  it('returns default when env is unset', () => {
    delete process.env.PREVIEW_GENERATION_LIMIT
    expect(previewGenerationLimit()).toBe(PREVIEW_GENERATION_LIMIT_DEFAULT)
  })

  it('returns 1 when env is 1', () => {
    process.env.PREVIEW_GENERATION_LIMIT = '1'
    expect(previewGenerationLimit()).toBe(1)
  })

  it('clamps values above max to 2', () => {
    process.env.PREVIEW_GENERATION_LIMIT = '10'
    expect(previewGenerationLimit()).toBe(2)
  })

  it('returns default for invalid env', () => {
    process.env.PREVIEW_GENERATION_LIMIT = 'abc'
    expect(previewGenerationLimit()).toBe(PREVIEW_GENERATION_LIMIT_DEFAULT)
  })
})

describe('previewGenerationLimitReachedMessage', () => {
  it('uses singular for limit 1', () => {
    expect(previewGenerationLimitReachedMessage(1)).toContain('1 diseño ')
    expect(previewGenerationLimitReachedMessage(1)).not.toContain('diseños')
  })

  it('uses plural for limit 2', () => {
    expect(previewGenerationLimitReachedMessage(2)).toContain('2 diseños')
  })
})

describe('buildPreviewGenerationStatus', () => {
  it('allows generation when count is below limit', () => {
    expect(buildPreviewGenerationStatus(1, 2)).toEqual({
      generationCount: 1,
      maxGenerations: 2,
      canGenerate: true,
    })
  })

  it('blocks generation when count reaches limit', () => {
    expect(buildPreviewGenerationStatus(2, 2)).toEqual({
      generationCount: 2,
      maxGenerations: 2,
      canGenerate: false,
    })
  })
})
