import sharp from 'sharp'

type WatermarkOptions = {
  label?: string
  width?: number
}

export async function compressTattooPreview(
  image: Buffer | Uint8Array,
  width = 1200,
): Promise<Buffer> {
  return sharp(image)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer()
}

export async function watermarkTattooPreview(
  image: Buffer | Uint8Array,
  options: WatermarkOptions = {},
): Promise<Buffer> {
  const label = options.label ?? 'Inkyra'
  const width = options.width ?? 1200
  const base = sharp(image).resize({ width, withoutEnlargement: true }).webp({
    quality: 86,
  })
  const metadata = await base.metadata()
  const overlayWidth = metadata.width ?? width
  const overlayHeight = metadata.height ?? overlayWidth

  const tileSize = 220
  const opacity = 0.16
  const svg = `
    <svg width="${overlayWidth}" height="${overlayHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="watermark" width="${tileSize}" height="${tileSize}" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <text x="12" y="110" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="white" fill-opacity="${opacity}">${escapeXml(label)}</text>
          <text x="12" y="150" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="white" fill-opacity="${opacity}">PREVIEW</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#watermark)" />
    </svg>`

  return base
    .composite([{ input: Buffer.from(svg), blend: 'over' }])
    .webp({ quality: 86 })
    .toBuffer()
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}
