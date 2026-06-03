import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { parseMercadoPagoReturnSearchParams } from '@/lib/payments/mp-return-search-params'
import {
  hasMercadoPagoReturnParams,
  syncDepositFromReturnUrl,
} from '@/lib/payments/sync-return-payment'
import { BackLink } from '@/modules/seguimiento/components/back-link'
import { CheckoutButton } from '@/modules/seguimiento/components/checkout-button'
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

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: { index: false, follow: false },
  }
}

type PageSearchParams = Record<string, string | string[] | undefined>

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<PageSearchParams>
}

export default async function SeguimientoPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const returnParams = parseMercadoPagoReturnSearchParams(await searchParams)
  const request = await findRequestBySlug(slug)
  if (!request) notFound()

  if (hasMercadoPagoReturnParams(returnParams)) {
    await syncDepositFromReturnUrl({
      requestId: request.id,
      currentStatus: request.status ?? 'QUOTED',
      searchParams: returnParams,
    })
    redirect(`/seguimiento/${slug}`)
  }

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
        {request.status === 'QUOTED' &&
        request.requestCode &&
        request.depositCents ? (
          <CheckoutButton
            requestCode={request.requestCode}
            depositCents={request.depositCents}
            currency={request.currency}
          />
        ) : null}
        <RequestFooter requestCode={request.requestCode} />
      </div>
    </div>
  )
}
