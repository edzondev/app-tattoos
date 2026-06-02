import { z } from 'zod'
import {
  REQUEST_STATUS_VALUES,
  type RequestStatus,
  RequestStatus as RequestStatusEnum,
} from '@/lib/db/enums'
import { STATUS_LABELS } from '@/lib/labels'

export const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = (
  Object.values(RequestStatusEnum) as RequestStatus[]
).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))

const statusFilterValues = ['', ...REQUEST_STATUS_VALUES] as const

// Zod enum: valores de Drizzle + "" para "sin filtro"
export const adminFiltersSchema = z.object({
  search: z.string(),
  status: z.enum(statusFilterValues),
})

export type AdminFiltersValues = z.infer<typeof adminFiltersSchema>

export function parseStatusFilter(
  value: string | null | undefined,
): AdminFiltersValues['status'] {
  const result = adminFiltersSchema.shape.status.safeParse(value ?? '')
  return result.success ? result.data : ''
}
