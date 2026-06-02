import { useEffect, useState } from 'react'
import { type ColorMode, TattooStyle } from '@/lib/db/enums'

export type PortfolioImage = {
  id: string
  publicUrl: string | null
  sortOrder: number
}

export type PortfolioItem = {
  id: string
  title: string
  description: string | null
  style: TattooStyle
  bodyZone: string | null
  colorMode: ColorMode
  images: PortfolioImage[]
}

const STYLE_ORDER = Object.values(TattooStyle)

export function usePortfolio(items: PortfolioItem[]) {
  const [activeFilter, setActiveFilter] = useState<TattooStyle | null>(null)
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const availableStyles = (() => {
    const set = new Set(items.map((i) => i.style))
    return STYLE_ORDER.filter((s) => set.has(s))
  })()

  const filtered = activeFilter
    ? items.filter((i) => i.style === activeFilter)
    : items

  const openLightbox = (item: PortfolioItem) => {
    setLightboxItem(item)
    setLightboxIndex(0)
  }

  const closeLightbox = () => {
    setLightboxItem(null)
  }

  const handlePrev = () => {
    setLightboxIndex((i) => Math.max(0, i - 1))
  }

  const handleNext = () => {
    if (lightboxItem) {
      setLightboxIndex((i) => Math.min(lightboxItem.images.length - 1, i + 1))
    }
  }

  const handleSelectIndex = (idx: number) => {
    setLightboxIndex(idx)
  }

  useEffect(() => {
    if (!lightboxItem) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxItem(null)
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => Math.min(lightboxItem.images.length - 1, i + 1))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxItem])

  return {
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
  }
}
