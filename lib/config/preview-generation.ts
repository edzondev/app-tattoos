export { PREVIEW_GENERATION_LIMIT_DEFAULT } from '@/lib/env'

export type PreviewGenerationStatus = {
  generationCount: number
  maxGenerations: number
  canGenerate: boolean
}

export function previewGenerationLimitReachedMessage(limit: number): string {
  return `Alcanzaste el límite de ${limit} diseño${limit === 1 ? '' : 's'} para esta solicitud. Escríbenos por WhatsApp para continuar.`
}

export function buildPreviewGenerationStatus(
  generationCount: number,
  maxGenerations: number,
): PreviewGenerationStatus {
  return {
    generationCount,
    maxGenerations,
    canGenerate: generationCount < maxGenerations,
  }
}
