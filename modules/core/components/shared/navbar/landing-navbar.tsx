'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { APP_NAME } from '@/lib/config/brand'
import { Button } from '@/modules/core/components/ui/button'

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)

  const handleRefNavigate = (sectionId: string) => {
    setOpen(false)
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        <Link
          href="/"
          className="font-bebas text-4xl tracking-wider bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent"
          prefetch
        >
          {APP_NAME}
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#portafolio"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground font-grotesk"
          >
            Portafolio
          </a>
          <a
            href="#como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground font-grotesk"
          >
            Cómo funciona
          </a>
          <Link href="/generator">
            <Button size="sm" className="font-grotesk font-medium">
              Generar idea
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden animate-fade-in">
          <div className="flex flex-col items-start gap-4 py-6 px-4 lg:px-6">
            <Button
              variant="link"
              onClick={() => handleRefNavigate('portafolio')}
            >
              Portafolio
            </Button>
            <Button
              variant="link"
              onClick={() => handleRefNavigate('como-funciona')}
            >
              Cómo funciona
            </Button>
            <Button
              size="sm"
              className="w-full font-grotesk font-semibold"
              asChild
            >
              <Link href="/generator" onClick={() => setOpen(false)}>
                Generar idea con IA
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
