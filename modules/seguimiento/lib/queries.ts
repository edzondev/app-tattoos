import { eq, or } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import type { TrackingRequest } from '../types'

const TRACKING_COLUMNS = {
  id: true,
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
  currency: true,
  priceCents: true,
  depositCents: true,
  paymentStatus: true,
  selectedImageR2Key: true,
  selectedImagePublicUrl: true,
} as const

/**
 * Uncached read — use after mutations in the same request (React `cache()` would
 * return stale rows if called twice with the same slug).
 */
export async function queryTrackingRequestBySlug(
  slug: string,
): Promise<TrackingRequest | null> {
  const row = await db.query.tattooRequest.findFirst({
    where: or(
      eq(tattooRequest.trackingToken, slug),
      eq(tattooRequest.requestCode, slug),
    ),
    columns: TRACKING_COLUMNS,
  })
  if (!row) return null

  return {
    ...row,
    selectedImagePublicUrl:
      row.selectedImageR2Key && row.requestCode
        ? `/api/design/${row.requestCode}`
        : row.selectedImagePublicUrl,
  }
}

/**
 * Fetches a tracking request by either its `trackingToken` (public URL slug)
 * or its `requestCode` (ZT-XXXX). Single `OR` query — both columns are indexed,
 * so we avoid a sequential waterfall.
 */
export const findRequestBySlug = cache(queryTrackingRequestBySlug)
