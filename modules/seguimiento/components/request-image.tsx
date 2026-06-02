import Image from 'next/image'

type Props = { src: string | null; alt?: string }

export function RequestImage({ src, alt }: Props) {
  if (!src) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50">
        <p className="font-grotesk text-sm text-muted-foreground">
          Imagen no disponible aún
        </p>
      </div>
    )
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Image
        src={src}
        alt={alt ?? 'Diseño de tatuaje seleccionado'}
        fill
        sizes="(min-width: 768px) 42rem, 100vw"
        className="object-contain"
        priority
      />
    </div>
  )
}
