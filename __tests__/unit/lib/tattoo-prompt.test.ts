import { describe, expect, it } from 'vitest'
import { ColorMode, TattooSize, TattooStyle } from '@/lib/db/enums'
import { buildTattooPrompt } from '@/lib/prompts/tattoo-prompt'
import type { Step1Input, Step2Input } from '@/modules/schemas/tattoo'

const baseStep1: Step1Input = {
  style: TattooStyle.DOTWORK,
  bodyZone: 'forearm',
  size: TattooSize.SMALL,
  colorMode: ColorMode.BLACK_AND_GREY,
  detailLevel: 3,
}

describe('buildTattooPrompt', () => {
  it('includes style, body zone, and size from step1', () => {
    const prompt = buildTattooPrompt(baseStep1)
    expect(prompt).toContain('estilo dotwork')
    expect(prompt).toContain('forearm')
    expect(prompt).toContain('small')
  })

  it('uses color mode for black and grey', () => {
    const prompt = buildTattooPrompt({
      ...baseStep1,
      colorMode: ColorMode.BLACK_AND_GREY,
    })
    expect(prompt).toContain('en blanco y negro')
  })

  it('uses color mode for color tattoos', () => {
    const prompt = buildTattooPrompt({
      ...baseStep1,
      colorMode: ColorMode.COLOR,
    })
    expect(prompt).toContain('a color')
  })

  it('reflects detail level in the prompt', () => {
    const low = buildTattooPrompt({ ...baseStep1, detailLevel: 1 })
    const high = buildTattooPrompt({ ...baseStep1, detailLevel: 5 })
    expect(low).toContain('nivel de detalle bajo')
    expect(high).toContain('nivel de detalle alto')
  })

  it('uses default idea when step2 is absent', () => {
    const prompt = buildTattooPrompt(baseStep1)
    expect(prompt).toContain(
      'Crea un concepto de tatuaje visualmente impactante.',
    )
  })

  it('includes specialInstructions from step2', () => {
    const step2: Step2Input = { specialInstructions: 'add roses around it' }
    const prompt = buildTattooPrompt(baseStep1, step2)
    expect(prompt).toContain('add roses around it')
  })

  it('requires a single tattoo image without text or watermarks', () => {
    const prompt = buildTattooPrompt(baseStep1)
    expect(prompt).toContain('Genera exactamente una sola imagen')
    expect(prompt).toContain('No incluir texto')
  })

  describe('style variations', () => {
    const styles = [
      TattooStyle.COVER_UP,
      TattooStyle.WATERCOLOR,
      TattooStyle.GEOMETRIC,
      TattooStyle.SURREALISM,
    ] as const

    for (const style of styles) {
      it(`includes style ${style} in the prompt`, () => {
        const prompt = buildTattooPrompt({ ...baseStep1, style })
        expect(prompt).toContain(`estilo ${style.toLowerCase()}`)
      })
    }
  })
})
