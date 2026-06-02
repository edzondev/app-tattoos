import type { RequestStatus } from '@/lib/db/enums'
import { StatusBadge } from './status-badge'

type Props = {
  requestCode: string | null
  status: RequestStatus | null
  completedSteps: number
  totalSteps: number
}

export function RequestHeader({
  requestCode,
  status,
  completedSteps,
  totalSteps,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-bebas text-4xl tracking-wide">
          Seguimiento de solicitud
        </h1>
        {requestCode ? (
          <span className="font-bebas text-2xl tracking-widest text-primary">
            {requestCode}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {status ? <StatusBadge status={status} /> : null}
        <span className="font-grotesk text-xs text-muted-foreground">
          {completedSteps} de {totalSteps} etapas completadas
        </span>
      </div>
    </div>
  )
}
