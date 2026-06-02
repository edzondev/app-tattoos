'use client'

import { Button } from '@/modules/core/components/ui/button'

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="font-bebas text-3xl tracking-wide">Algo salió mal</h2>
      <p className="font-grotesk text-sm text-muted-foreground max-w-md">
        Ocurrió un error inesperado al cargar esta sección. Por favor, intenta
        de nuevo.
      </p>
      <Button onClick={() => reset()} className="font-grotesk font-semibold">
        Intentar de nuevo
      </Button>
    </div>
  )
}
