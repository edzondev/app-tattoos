export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    const [first] = forwardedFor.split(',')
    const ip = first?.trim()
    if (ip) return ip
  }

  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  const cfConnectingIp = headers.get('cf-connecting-ip')?.trim()
  if (cfConnectingIp) return cfConnectingIp

  return 'unknown'
}
