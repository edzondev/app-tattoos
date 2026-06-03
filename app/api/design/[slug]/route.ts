import { eq, or } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { getR2Object } from '@/lib/r2/objects'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const request = await db.query.tattooRequest.findFirst({
    where: or(
      eq(tattooRequest.requestCode, slug),
      eq(tattooRequest.trackingToken, slug),
    ),
    columns: {
      selectedImageR2Key: true,
      selectedImageWatermarkedR2Key: true,
      selectedImageMimeType: true,
      depositConfirmedAt: true,
    },
  })

  if (!request?.selectedImageR2Key) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const key = request.depositConfirmedAt
    ? request.selectedImageR2Key
    : (request.selectedImageWatermarkedR2Key ?? request.selectedImageR2Key)

  try {
    const object = await getR2Object(key)
    return new NextResponse(Buffer.from(object.body), {
      headers: {
        'Content-Type': request.selectedImageMimeType ?? object.contentType,
        'Cache-Control': request.depositConfirmedAt
          ? 'private, max-age=300'
          : 'private, no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'image_unavailable' }, { status: 404 })
  }
}
