'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { STYLE_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { Button } from '../core/components/ui/button'
import type { PortfolioItem } from './use-portfolio'

type LightboxProps = {
  item: PortfolioItem
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onSelectIndex: (idx: number) => void
}

export default function PortfolioLightbox({
  item,
  index,
  onClose,
  onPrev,
  onNext,
  onSelectIndex,
}: LightboxProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Cerrar galería"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex flex-col items-center max-w-xl w-full mx-4">
        <Button
          onClick={onClose}
          size="icon"
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
        >
          <X size={28} />
        </Button>

        <div className="relative w-full flex items-center justify-center">
          {item.images.length > 1 && index > 0 ? (
            <Button
              type="button"
              onClick={onPrev}
              size="icon"
              className="absolute left-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={24} />
            </Button>
          ) : null}

          <div className="overflow-hidden rounded-xl max-h-[80vh]">
            {item.images[index]?.publicUrl ? (
              <Image
                src={item.images[index].publicUrl}
                alt={item.title}
                width={1200}
                height={1200}
                unoptimized
                className="max-h-[80vh] w-auto object-contain"
              />
            ) : (
              <div className="flex size-96 items-center justify-center bg-ink-medium rounded-xl">
                <span className="font-bebas text-6xl text-muted-foreground/30">
                  {STYLE_LABELS[item.style].charAt(0)}
                </span>
              </div>
            )}
          </div>

          {item.images.length > 1 && index < item.images.length - 1 ? (
            <Button
              type="button"
              onClick={onNext}
              className="absolute right-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={24} />
            </Button>
          ) : null}
        </div>

        <div className="mt-4 text-center">
          <h3 className="font-bebas text-2xl text-white tracking-wide">
            {item.title}
          </h3>
          <p className="text-sm text-white/60 font-grotesk">
            {STYLE_LABELS[item.style]}
            {item.bodyZone ? ` — ${item.bodyZone}` : ''}
          </p>
          {item.images.length > 1 ? (
            <div className="mt-3 flex justify-center gap-2">
              {item.images.map((image, idx) => (
                <button
                  key={image.id}
                  type="button"
                  aria-label={`Seleccionar imagen ${idx + 1}`}
                  onClick={() => onSelectIndex(idx)}
                  className={cn(
                    'size-2 rounded-full transition-colors',
                    idx === index
                      ? 'bg-primary'
                      : 'bg-white/30 hover:bg-white/60',
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
