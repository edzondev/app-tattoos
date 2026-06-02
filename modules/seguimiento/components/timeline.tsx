import { cva, type VariantProps } from 'class-variance-authority'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineEvent } from '../types'

const stepMarkerVariants = cva(
  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
  {
    variants: {
      state: {
        done: 'border-emerald-500 bg-emerald-500/15 text-emerald-500',
        pending: 'border-border bg-card text-muted-foreground',
      },
    },
    defaultVariants: { state: 'pending' },
  },
)

const stepConnectorVariants = cva('mt-1 w-px flex-1 min-h-8', {
  variants: {
    state: {
      done: 'bg-emerald-500/40',
      pending: 'bg-border',
    },
  },
  defaultVariants: { state: 'pending' },
})

const stepTitleVariants = cva(
  'font-grotesk text-sm font-semibold leading-tight',
  {
    variants: {
      state: {
        done: 'text-foreground',
        pending: 'text-muted-foreground',
      },
    },
    defaultVariants: { state: 'pending' },
  },
)

type State = NonNullable<VariantProps<typeof stepMarkerVariants>['state']>

function formatTimestamp(date: Date): string {
  return format(date, 'd MMM yyyy, HH:mm', { locale: es })
}

type StepProps = { event: TimelineEvent; isLast: boolean }

export function TimelineStep({ event, isLast }: StepProps) {
  const state: State = event.doneAt !== null ? 'done' : 'pending'
  const isDone = state === 'done'

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(stepMarkerVariants({ state }))}>
          {isDone ? (
            <Check className="size-4" />
          ) : (
            <Circle className="size-3.5" />
          )}
        </div>
        {isLast ? null : (
          <div className={cn(stepConnectorVariants({ state }))} />
        )}
      </div>
      <div className="pb-8 min-w-0">
        <p className={cn(stepTitleVariants({ state }))}>{event.label}</p>
        <p className="mt-0.5 font-grotesk text-xs text-muted-foreground">
          {event.description}
        </p>
        {isDone && event.doneAt ? (
          <p className="mt-1 flex items-center gap-1 font-grotesk text-xs text-muted-foreground/70">
            <Clock className="size-3" />
            {formatTimestamp(event.doneAt)}
          </p>
        ) : null}
      </div>
    </div>
  )
}

type Props = { events: TimelineEvent[] }

export function ProcessTimeline({ events }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h2 className="font-bebas text-xl tracking-wide">Estado del proceso</h2>
      <div className="pt-2">
        {events.map((event, index) => (
          <TimelineStep
            key={event.key}
            event={event}
            isLast={index === events.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
