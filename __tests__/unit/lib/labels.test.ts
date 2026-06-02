import { describe, expect, it } from 'vitest'
import { RequestStatus, TattooSize, TattooStyle } from '@/lib/db/enums'
import {
  getSizeLabel,
  getStatusLabel,
  getStyleLabel,
  SIZE_LABELS,
  STATUS_LABELS,
  STYLE_LABELS,
} from '@/lib/labels'

describe('STYLE_LABELS', () => {
  it('covers every TattooStyle value', () => {
    for (const value of Object.values(TattooStyle)) {
      expect(STYLE_LABELS).toHaveProperty(value)
      expect(typeof STYLE_LABELS[value]).toBe('string')
    }
  })
})

describe('STATUS_LABELS', () => {
  it('covers every RequestStatus value', () => {
    for (const value of Object.values(RequestStatus)) {
      expect(STATUS_LABELS).toHaveProperty(value)
      expect(typeof STATUS_LABELS[value]).toBe('string')
    }
  })
})

describe('SIZE_LABELS', () => {
  it('covers every TattooSize value', () => {
    for (const value of Object.values(TattooSize)) {
      expect(SIZE_LABELS).toHaveProperty(value)
      expect(typeof SIZE_LABELS[value]).toBe('string')
    }
  })
})

describe('getStyleLabel', () => {
  it('returns the correct label for COVER_UP', () => {
    expect(getStyleLabel(TattooStyle.COVER_UP)).toBe('Cover Up')
  })

  it('returns the correct label for DOTWORK', () => {
    expect(getStyleLabel(TattooStyle.DOTWORK)).toBe('Puntillismo')
  })

  it('returns the correct label for GEOMETRIC', () => {
    expect(getStyleLabel(TattooStyle.GEOMETRIC)).toBe('Geométricos')
  })

  it("returns 'Desconocido' for an unknown value", () => {
    expect(getStyleLabel('UNKNOWN_STYLE' as TattooStyle)).toBe('Desconocido')
  })
})

describe('getStatusLabel', () => {
  it("returns 'Enviado' for SENT", () => {
    expect(getStatusLabel(RequestStatus.SENT)).toBe('Enviado')
  })

  it("returns 'Cotizado' for QUOTED", () => {
    expect(getStatusLabel(RequestStatus.QUOTED)).toBe('Cotizado')
  })

  it("returns 'Cita confirmada' for APPOINTMENT_CONFIRMED", () => {
    expect(getStatusLabel(RequestStatus.APPOINTMENT_CONFIRMED)).toBe(
      'Cita confirmada',
    )
  })

  it("returns 'Finalizado' for FINISHED", () => {
    expect(getStatusLabel(RequestStatus.FINISHED)).toBe('Finalizado')
  })

  it("returns 'Expirado' for EXPIRED", () => {
    expect(getStatusLabel(RequestStatus.EXPIRED)).toBe('Expirado')
  })

  it("returns 'Desconocido' for an unknown value", () => {
    expect(getStatusLabel('UNKNOWN_STATUS' as RequestStatus)).toBe(
      'Desconocido',
    )
  })
})

describe('getSizeLabel', () => {
  it("returns 'Pequeño' for SMALL", () => {
    expect(getSizeLabel(TattooSize.SMALL)).toBe('Pequeño')
  })

  it("returns 'Mediano' for MEDIUM", () => {
    expect(getSizeLabel(TattooSize.MEDIUM)).toBe('Mediano')
  })

  it("returns 'Grande' for LARGE", () => {
    expect(getSizeLabel(TattooSize.LARGE)).toBe('Grande')
  })

  it("returns 'Otro' for OTHER", () => {
    expect(getSizeLabel(TattooSize.OTHER)).toBe('Otro')
  })

  it("returns 'Desconocido' for an unknown value", () => {
    expect(getSizeLabel('UNKNOWN_SIZE' as TattooSize)).toBe('Desconocido')
  })
})
