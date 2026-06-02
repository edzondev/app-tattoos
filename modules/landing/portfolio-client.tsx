'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { STYLE_LABELS } from '@/lib/labels'
import { type PortfolioItem, usePortfolio } from './use-portfolio'

const PortfolioLightbox = dynamic(() => import('./portfolio-lightbox'), {
  ssr: false,
})

type Props = {
  items: PortfolioItem[]
}

export default function PortfolioClient({ items }: Props) {
  const {
    activeFilter,
    setActiveFilter,
    availableStyles,
    filtered,
    lightboxItem,
    lightboxIndex,
    openLightbox,
    closeLightbox,
    handlePrev,
    handleNext,
    handleSelectIndex,
  } = usePortfolio(items)

  return (
    <>
      {/* Filter chips */}
      {availableStyles.length > 1 ? (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-grotesk transition-colors ${
              activeFilter === null
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            Todos
          </button>
          {availableStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() =>
                setActiveFilter(activeFilter === style ? null : style)
              }
              className={`rounded-full px-4 py-1.5 text-sm font-grotesk transition-colors ${
                activeFilter === style
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {STYLE_LABELS[style]}
            </button>
          ))}
        </div>
      ) : null}

      {/* Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {filtered.map((item) => {
          const thumb = item.images[0]
          const styleLabel = STYLE_LABELS[item.style]
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(item)}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 text-left transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                {thumb?.publicUrl ? (
                  <Image
                    src={thumb.publicUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-ink-medium">
                    <span className="font-bebas text-5xl text-muted-foreground/30">
                      {styleLabel.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bebas text-base tracking-wide truncate">
                  {item.title}
                </h3>
                <span className="text-xs text-muted-foreground font-grotesk">
                  {styleLabel}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground font-grotesk py-12">
          No hay trabajos en esta categoría aún.
        </p>
      ) : null}

      {/* Lightbox */}
      {lightboxItem ? (
        <PortfolioLightbox
          item={lightboxItem}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelectIndex={handleSelectIndex}
        />
      ) : null}
    </>
  )
}
