import { asc, eq } from 'drizzle-orm'
import { Suspense } from 'react'
import { db } from '@/lib/db'
import { portfolioItem } from '@/lib/db/schema'
import { Skeleton } from '../core/components/ui/skeleton'
import PortfolioClient from './portfolio-client'

const LoadingPortfolio = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholder
        <Skeleton key={index} className="h-56 w-auto rounded-xl" />
      ))}
    </div>
  )
}

async function PortfolioData() {
  const items = await db.query.portfolioItem.findMany({
    where: eq(portfolioItem.isPublished, true),
    orderBy: asc(portfolioItem.sortOrder),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.sortOrder)],
      },
    },
  })

  return <PortfolioClient items={items} />
}

export default function Portfolio() {
  return (
    <section
      id="portafolio"
      className="py-96 md:py-32 border-t border-border/30"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mb-16 text-center">
          <h2 className="font-bebas text-4xl tracking-wide sm:text-5xl md:text-6xl">
            Trabajos{' '}
            <span className="bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent">
              Reales
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground font-grotesk max-w-lg mx-auto">
            Cada pieza cuenta una historia. Explora nuestro portafolio de
            tatuajes terminados.
          </p>
        </div>

        <Suspense fallback={<LoadingPortfolio />}>
          <PortfolioData />
        </Suspense>
      </div>
    </section>
  )
}
