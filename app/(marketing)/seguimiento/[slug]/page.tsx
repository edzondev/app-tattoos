import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink } from '@/modules/seguimiento/components/back-link'
import { DesignDetails } from '@/modules/seguimiento/components/design-details'
import { RequestFooter } from '@/modules/seguimiento/components/request-footer'
import { RequestHeader } from '@/modules/seguimiento/components/request-header'
import { RequestImage } from '@/modules/seguimiento/components/request-image'
import { ProcessTimeline } from '@/modules/seguimiento/components/timeline'
import { findRequestBySlug } from '@/modules/seguimiento/lib/queries'
import {
  buildTimeline,
  countCompletedSteps,
} from '@/modules/seguimiento/lib/timeline'

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: { index: false, follow: false },
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function SeguimientoPage({ params }: PageProps) {
  const { slug } = await params
  const request = await findRequestBySlug(slug)
  if (!request) notFound()

  const timeline = buildTimeline(request)
  const completedSteps = countCompletedSteps(timeline)

  return (
    <div className="min-h-dvh py-8 pt-22">
      <div className="container mx-auto max-w-2xl space-y-8">
        <BackLink />
        <RequestHeader
          requestCode={request.requestCode}
          status={request.status}
          completedSteps={completedSteps}
          totalSteps={timeline.length}
        />
        <RequestImage src={request.selectedImagePublicUrl} />
        <DesignDetails request={request} />
        <ProcessTimeline events={timeline} />
        <RequestFooter requestCode={request.requestCode} />
      </div>
    </div>
  )
}
