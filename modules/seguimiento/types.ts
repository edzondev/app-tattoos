import type {
  ColorMode,
  RequestStatus,
  TattooSize,
  TattooStyle,
} from '@/lib/db/enums'

export type TrackingRequest = {
  requestCode: string | null
  status: RequestStatus | null
  style: TattooStyle
  bodyZone: string
  size: TattooSize
  colorMode: ColorMode
  detailLevel: number
  fullName: string | null
  district: string | null
  availability: string | null
  sentAt: Date | null
  quotedAt: Date | null
  depositConfirmedAt: Date | null
  appointmentAt: Date | null
  finishedAt: Date | null
  selectedImagePublicUrl: string | null
}

export type TimelineEvent = {
  key: TimelineKey
  label: string
  description: string
  doneAt: Date | null
}

export type TimelineKey =
  | 'sent'
  | 'quoted'
  | 'deposit_confirmed'
  | 'appointment'
  | 'finished'
