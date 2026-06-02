import type { ColorMode, RequestStatus } from '@/lib/db/enums'
import { getSizeLabel, getStatusLabel, getStyleLabel } from '@/lib/labels'
import type { TrackingRequest } from '../types'

const TRACKING_STATUS_LABELS: Record<RequestStatus, string> = {
  SENT: 'Solicitud enviada',
  QUOTED: 'Cotización enviada',
  APPOINTMENT_CONFIRMED: 'Cita confirmada',
  FINISHED: 'Completado',
  EXPIRED: 'Expirado',
}

export function getTrackingStatusLabel(status: RequestStatus): string {
  return TRACKING_STATUS_LABELS[status] ?? getStatusLabel(status)
}

export function getColorModeShortLabel(mode: ColorMode): string {
  return mode === 'COLOR' ? 'Color' : 'Blanco y negro'
}

type DetailItem = { label: string; value: string }

export function buildDesignDetails(request: TrackingRequest): DetailItem[] {
  const items: DetailItem[] = [
    { label: 'Estilo', value: getStyleLabel(request.style) },
    { label: 'Zona', value: request.bodyZone },
    { label: 'Tamaño', value: getSizeLabel(request.size) },
    { label: 'Color', value: getColorModeShortLabel(request.colorMode) },
    { label: 'Detalle', value: `${request.detailLevel} / 5` },
  ]
  if (request.fullName) {
    items.push({ label: 'Solicitante', value: request.fullName })
  }
  if (request.district) {
    items.push({ label: 'Distrito', value: request.district })
  }
  if (request.availability) {
    items.push({ label: 'Disponibilidad', value: request.availability })
  }
  return items
}
