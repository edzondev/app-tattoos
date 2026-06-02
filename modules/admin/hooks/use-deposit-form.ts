'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError, api } from '@/lib/api'
import { RequestStatus } from '@/lib/db/enums'

export const adminLeadFormSchema = z.object({
  priceCents: z
    .number({ error: 'Ingresa un monto válido' })
    .int('Debe ser un número entero')
    .positive('El precio debe ser mayor a 0')
    .optional(),
  depositCents: z
    .number({ error: 'Ingresa un monto válido' })
    .int('Debe ser un número entero')
    .positive('El adelanto debe ser mayor a 0')
    .optional(),
  status: z.enum(RequestStatus).optional(),
  appointmentAt: z.date().optional(),
})

export type AdminLeadFormValues = z.infer<typeof adminLeadFormSchema>

export type AdminLeadFormDefaults = {
  id: string
  priceCents?: number | null
  depositCents?: number | null
  status?: RequestStatus | null
}

type SubmitResult =
  | { ok: true }
  | { ok: false; message: string; partial?: boolean }

export function useAdminLeadForm(defaults: AdminLeadFormDefaults) {
  const router = useRouter()
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AdminLeadFormValues>({
    resolver: zodResolver(adminLeadFormSchema),
    defaultValues: {
      priceCents: defaults.priceCents ?? undefined,
      depositCents: defaults.depositCents ?? undefined,
      status: defaults.status ?? undefined,
    },
  })

  const handleSubmit = async (data: AdminLeadFormValues) => {
    setIsSubmitting(true)
    setResult(null)

    const { id } = defaults
    const errors: string[] = []
    let quoteSucceeded = false
    let effectiveStatus: RequestStatus | null | undefined = defaults.status

    try {
      const hasQuoteData =
        data.priceCents !== undefined || data.depositCents !== undefined
      const quoteChanged =
        data.priceCents !== (defaults.priceCents ?? undefined) ||
        data.depositCents !== (defaults.depositCents ?? undefined)

      if (hasQuoteData && quoteChanged) {
        if (!data.priceCents || !data.depositCents) {
          errors.push('Debes ingresar tanto el precio total como el adelanto.')
        } else {
          try {
            await api(`/api/admin/requests/${id}/quote`, {
              method: 'POST',
              body: JSON.stringify({
                priceCents: data.priceCents,
                depositCents: data.depositCents,
                currency: 'PEN',
              }),
            })
            quoteSucceeded = true
            effectiveStatus = RequestStatus.QUOTED
          } catch (err) {
            const msg =
              err instanceof ApiError
                ? `Error al guardar cotización (${err.status})`
                : 'Error inesperado al guardar la cotización.'
            errors.push(msg)
          }
        }
      }

      const statusChanged = data.status && data.status !== defaults.status
      const statusAlreadyApplied =
        quoteSucceeded && data.status === RequestStatus.QUOTED
      const needsStatusUpdate =
        statusChanged &&
        data.status &&
        !statusAlreadyApplied &&
        data.status !== effectiveStatus

      if (needsStatusUpdate && data.status) {
        try {
          await api(`/api/admin/requests/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({
              status: data.status,
              ...(data.appointmentAt
                ? { appointmentAt: data.appointmentAt }
                : {}),
            }),
          })
          effectiveStatus = data.status
        } catch (err) {
          if (err instanceof ApiError) {
            const body = err.body as Record<string, unknown> | null
            if (body?.error === 'invalid_transition') {
              errors.push(
                `Transición de estado inválida: "${body.current}" → "${body.target}".`,
              )
            } else {
              errors.push(`Error al cambiar estado (${err.status}).`)
            }
          } else {
            errors.push('Error inesperado al cambiar el estado.')
          }
        }
      }

      const savedValues: AdminLeadFormValues = {
        ...data,
        status: effectiveStatus ?? data.status,
      }

      if (errors.length > 0) {
        if (quoteSucceeded) {
          setResult({
            ok: false,
            partial: true,
            message: `La cotización se guardó correctamente. ${errors.join(' ')}`,
          })
          form.reset(savedValues)
          router.refresh()
        } else {
          setResult({ ok: false, message: errors.join(' ') })
        }
      } else {
        setResult({ ok: true })
        form.reset(savedValues)
        router.refresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    handleSubmit,
    isSubmitting,
    result,
    clearResult: () => setResult(null),
  }
}
