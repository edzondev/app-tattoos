import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { watermarkTattooPreview } from '@/lib/images/watermark'

describe('watermarkTattooPreview', () => {
  it('returns a compressed webp image with a visible overlay applied', async () => {
    const source = await sharp({
      create: {
        width: 240,
        height: 240,
        channels: 3,
        background: '#ffffff',
      },
    })
      .png()
      .toBuffer()

    const result = await watermarkTattooPreview(source, {
      label: 'Inkyra',
      width: 240,
    })

    const metadata = await sharp(result).metadata()
    expect(metadata.format).toBe('webp')
    expect(metadata.width).toBe(240)
    expect(result.equals(source)).toBe(false)
  })
})
