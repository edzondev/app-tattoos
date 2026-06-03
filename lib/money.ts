/** Converts stored minor units (céntimos) to soles for display/input. */
export function centsToSoles(cents: number): number {
  return cents / 100
}

/** Converts soles entered by admin to minor units for storage. */
export function solesToCents(soles: number): number {
  return Math.round(soles * 100)
}

/** Admin form: DB/form state (cents) → value shown in the input (soles). */
export function adminCentsToDisplayValue(
  cents: number | null | undefined,
): number | '' {
  if (cents == null) return ''
  return centsToSoles(cents)
}

/** Admin form: raw input string (soles) → form state / API (cents). */
export function adminDisplayValueToCents(raw: string): number | undefined {
  if (raw === '') return undefined
  return solesToCents(Number(raw))
}

export function formatSolesFromCents(
  cents: number | null | undefined,
  currency = 'PEN',
): string {
  if (cents == null) return '—'
  const prefix = currency === 'PEN' ? 'S/' : currency
  const soles = centsToSoles(cents)
  const hasFraction = !Number.isInteger(soles)
  return `${prefix} ${soles.toLocaleString('es-PE', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}
