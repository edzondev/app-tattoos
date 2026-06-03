'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { ApiError, api } from '@/lib/api'
import { Button } from '@/modules/core/components/ui/button'

type Props = {
  requestCode: string
  depositCents: number
  currency: string
}

type CheckoutResponse = {
  preferenceId: string
  initPoint: string
}

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function CheckoutButton({ requestCode, depositCents, currency }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await api<CheckoutResponse>('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ requestCode }),
      })

      if (!result.initPoint) {
        throw new Error('No se pudo crear el enlace de pago.')
      }

      window.location.href = result.initPoint
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('La solicitud ya no está disponible para pagar.')
      } else if (err instanceof ApiError) {
        const body = err.body as { message?: string } | null
        setError(
          body?.message ?? 'No se pudo iniciar el pago. Intenta nuevamente.',
        )
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo iniciar el pago. Intenta nuevamente.',
        )
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-3">
      <div>
        <p className="font-bebas text-2xl tracking-wide">Confirma tu cita</p>
        <p className="font-grotesk text-sm text-muted-foreground">
          Paga el adelanto de {formatCents(depositCents, currency)} para
          desbloquear el diseño limpio y confirmar tu cita.
        </p>
      </div>
      {error ? (
        <p className="font-grotesk text-sm text-destructive">{error}</p>
      ) : null}
      <Button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full font-grotesk font-semibold"
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
        Pagar adelanto
      </Button>
    </div>
  )
}
