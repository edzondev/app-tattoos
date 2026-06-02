import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function BackLink() {
  return (
    <Link
      href="/generator"
      className="inline-flex items-center gap-1.5 font-grotesk text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Nuevo diseño
    </Link>
  )
}
