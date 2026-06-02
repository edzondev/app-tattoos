import { eq, or } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import type { TrackingRequest } from '../types'

const TRACKING_COLUMNS = {
  requestCode: true,
  status: true,
  style: true,
  bodyZone: true,
  size: true,
  colorMode: true,
  detailLevel: true,
  fullName: true,
  district: true,
  availability: true,
  sentAt: true,
  quotedAt: true,
  depositConfirmedAt: true,
  appointmentAt: true,
  finishedAt: true,
  selectedImagePublicUrl: true,
} as const

/**
 * Fetches a tracking request by either its `trackingToken` (public URL slug)
 * or its `requestCode` (ZT-XXXX). Single `OR` query — both columns are indexed,
 * so we avoid a sequential waterfall.
 */
export const findRequestBySlug = cache(
  async (slug: string): Promise<TrackingRequest | null> => {
    const row = await db.query.tattooRequest.findFirst({
      where: or(
        eq(tattooRequest.trackingToken, slug),
        eq(tattooRequest.requestCode, slug),
      ),
      columns: TRACKING_COLUMNS,
    })
    return row ?? null
  },
)
