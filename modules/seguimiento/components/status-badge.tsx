import { cva, type VariantProps } from 'class-variance-authority'
import type { RequestStatus } from '@/lib/db/enums'
import { cn } from '@/lib/utils'
import { getTrackingStatusLabel } from '../lib/labels'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium font-grotesk',
  {
    variants: {
      tone: {
        active: 'bg-primary/15 text-primary',
        finished: 'bg-emerald-500/15 text-emerald-500',
        expired: 'bg-destructive/15 text-destructive',
        neutral: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

const statusDotVariants = cva('h-1.5 w-1.5 rounded-full', {
  variants: {
    tone: {
      active: 'bg-primary animate-pulse',
      finished: 'bg-emerald-500',
      expired: 'bg-destructive',
      neutral: 'bg-muted-foreground',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

type Tone = NonNullable<VariantProps<typeof statusBadgeVariants>['tone']>

const STATUS_TONE: Record<RequestStatus, Tone> = {
  SENT: 'active',
  QUOTED: 'active',
  APPOINTMENT_CONFIRMED: 'active',
  FINISHED: 'finished',
  EXPIRED: 'expired',
}

type Props = { status: RequestStatus; className?: string }

export function StatusBadge({ status, className }: Props) {
  const tone = STATUS_TONE[status]
  return (
    <span className={cn(statusBadgeVariants({ tone }), className)}>
      <span className={cn(statusDotVariants({ tone }))} aria-hidden />
      {getTrackingStatusLabel(status)}
    </span>
  )
}
