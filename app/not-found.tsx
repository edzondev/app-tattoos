import Link from 'next/link'
import { Button } from '@/modules/core/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="font-bebas text-4xl tracking-wide">
        Página no encontrada
      </h2>
      <p className="font-grotesk text-sm text-muted-foreground max-w-md">
        La página que buscas no existe o ha sido movida.
      </p>
      <Button asChild className="font-grotesk font-semibold">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
