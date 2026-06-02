import type { Metadata } from 'next'
import Hero from '@/modules/landing/hero'
import HowItWorks from '@/modules/landing/how-it-works'
import Portfolio from '@/modules/landing/portfolio'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'INKSPIRE | Diseña tu tatuaje ideal con IA',
  description:
    'Diseña tu tatuaje ideal con inteligencia artificial, solicita tu cotización y agenda tu cita. Todo en un solo lugar.',
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Portfolio />
      <HowItWorks />
    </>
  )
}
