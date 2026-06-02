import { buildDesignDetails } from '../lib/labels'
import type { TrackingRequest } from '../types'

type Props = { request: TrackingRequest }

export function DesignDetails({ request }: Props) {
  const items = buildDesignDetails(request)
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h2 className="font-bebas text-xl tracking-wide">Detalles del diseño</h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-0.5">
            <dt className="font-grotesk text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </dt>
            <dd className="font-grotesk text-sm text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
