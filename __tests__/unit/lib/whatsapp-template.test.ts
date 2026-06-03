import { describe, expect, it } from 'vitest'
import { WHATSAPP_TEMPLATES } from '@/lib/config/brand'

describe('WHATSAPP_TEMPLATES.clientConfirmation', () => {
  it('includes structured client and design details', () => {
    const message = WHATSAPP_TEMPLATES.clientConfirmation({
      requestCode: 'ZT-1234',
      fullName: 'Valentina Torres',
      trackingUrl: 'https://inkyra.test/seguimiento/ZT-1234',
      designUrl: 'https://inkyra.test/api/design/ZT-1234',
    })

    expect(message).toContain('Valentina Torres')
    expect(message).toContain('ZT-1234')
    expect(message).toContain('https://inkyra.test/seguimiento/ZT-1234')
    expect(message).toContain('https://inkyra.test/api/design/ZT-1234')
  })
})
