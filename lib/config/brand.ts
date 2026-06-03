export const APP_NAME = 'Inkyra'
export const APP_TAGLINE = 'Tattoo Design & Booking, Powered by AI'

export const APP_DESCRIPTION_SHORT =
  'Diseña tu tatuaje con IA, solicita cotización y agenda tu cita. Inkyra: el estudio que empieza con tu idea.'

export const APP_DESCRIPTION_LONG =
  'Inkyra es una plataforma de diseño y reserva de tatuajes potenciada por inteligencia artificial. Genera diseños únicos, solicita tu cotización y agenda tu cita en un solo lugar.'

export function getAppCopyright(): string {
  return `© ${new Date().getFullYear()} ${APP_NAME}. Todos los derechos reservados.`
}

export const WHATSAPP_TEMPLATES = {
  clientConfirmation: (params: {
    requestCode: string
    fullName: string
    trackingUrl: string
    designUrl: string
  }): string =>
    [
      `Hola! Soy ${params.fullName} y acabo de enviar mi solicitud de diseño en ${APP_NAME}.`,
      ``,
      `*Código:* ${params.requestCode}`,
      `*Seguimiento:* ${params.trackingUrl}`,
      `*Diseño:* ${params.designUrl}`,
      ``,
      `¿Podrían darme más información?`,
    ].join('\n'),

  adminQuote: (
    name: string,
    code: string,
    total: string,
    adelanto: string,
    trackingUrl: string,
  ): string =>
    [
      `Hola ${name}, te escribimos de ${APP_NAME} respecto a tu solicitud *${code}*.`,
      ``,
      `*Cotización:*`,
      `• Precio total: ${total}`,
      `• Adelanto: ${adelanto}`,
      ``,
      `Para confirmar tu cita, envíanos el comprobante de pago del adelanto por este mismo chat.`,
      ``,
      `Puedes ver el estado de tu solicitud aquí: ${trackingUrl}`,
    ].join('\n'),
}
