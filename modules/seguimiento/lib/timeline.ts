import type { TimelineEvent } from '../types'

type Timestamps = {
  sentAt: Date | null
  quotedAt: Date | null
  depositConfirmedAt: Date | null
  appointmentAt: Date | null
  finishedAt: Date | null
}

export function buildTimeline(timestamps: Timestamps): TimelineEvent[] {
  return [
    {
      key: 'sent',
      label: 'Solicitud recibida',
      description:
        'Tu diseño y datos de contacto fueron enviados correctamente.',
      doneAt: timestamps.sentAt,
    },
    {
      key: 'quoted',
      label: 'Cotización enviada',
      description: 'Te enviamos la cotización por WhatsApp.',
      doneAt: timestamps.quotedAt,
    },
    {
      key: 'deposit_confirmed',
      label: 'Pago confirmado / Cita confirmada',
      description: 'Tu pago fue confirmado. ¡Ya estás en la agenda!',
      doneAt: timestamps.depositConfirmedAt ?? timestamps.appointmentAt,
    },
    {
      key: 'appointment',
      label: 'Cita programada',
      description: 'Tu sesión de tatuaje está confirmada.',
      doneAt: timestamps.appointmentAt,
    },
    {
      key: 'finished',
      label: 'Tatuaje completado',
      description: '¡Tu diseño cobró vida! Gracias por confiar en nosotros.',
      doneAt: timestamps.finishedAt,
    },
  ]
}

export function countCompletedSteps(events: TimelineEvent[]): number {
  let n = 0
  for (const e of events) if (e.doneAt !== null) n++
  return n
}
