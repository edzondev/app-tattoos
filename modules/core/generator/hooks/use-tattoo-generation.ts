import { useEffect, useRef, useState } from 'react'
import { ApiError, api } from '@/lib/api'
import {
  PREVIEW_GENERATION_LIMIT_DEFAULT,
  type PreviewGenerationStatus,
  previewGenerationLimitReachedMessage,
} from '@/lib/config/preview-generation'

export type PreviewItem = {
  id: string
  createdAt: number
  dataUrl: string
  mimeType: string
  r2Key: string
  watermarkedR2Key: string
  sizeBytes: number
  refineText?: string
}

type PreviewResponse = PreviewGenerationStatus & {
  dataUrl: string
  mimeType: string
  r2Key: string
  watermarkedR2Key: string
  sizeBytes: number
}

type GenerationState = PreviewGenerationStatus & {
  previews: PreviewItem[]
  selectedPreviewId: string | null
  isGenerating: boolean
  isStatusLoaded: boolean
  error: string | null
}

function applyGenerationStatus(
  status: PreviewGenerationStatus,
): Pick<GenerationState, 'generationCount' | 'maxGenerations' | 'canGenerate'> {
  return {
    generationCount: status.generationCount,
    maxGenerations: status.maxGenerations,
    canGenerate: status.canGenerate,
  }
}

export function useTattooGeneration(
  requestId: string | null,
  autoGenerate = false,
) {
  const [state, setState] = useState<GenerationState>({
    previews: [],
    selectedPreviewId: null,
    isGenerating: false,
    isStatusLoaded: false,
    error: null,
    generationCount: 0,
    maxGenerations: PREVIEW_GENERATION_LIMIT_DEFAULT,
    canGenerate: true,
  })
  const lockRef = useRef(false)
  const generatePreviewRef = useRef<(refineText?: string) => Promise<void>>(
    async () => {},
  )

  const selectedPreview =
    state.previews.find((p) => p.id === state.selectedPreviewId) ?? null

  const canRegenerate = state.canGenerate && !state.isGenerating

  const attemptLabel =
    state.generationCount > 0
      ? `Intento ${state.generationCount} de ${state.maxGenerations}`
      : ''

  const selectPreview = (id: string) => {
    setState((s) => {
      const exists = s.previews.some((p) => p.id === id)
      if (!exists) return s
      return { ...s, selectedPreviewId: id }
    })
  }

  const generatePreview = async (refineText?: string) => {
    if (!requestId) {
      setState((s) => ({ ...s, error: 'No hay solicitud activa.' }))
      return
    }

    if (lockRef.current) return
    if (!state.canGenerate) {
      setState((s) => ({
        ...s,
        error: previewGenerationLimitReachedMessage(s.maxGenerations),
      }))
      return
    }

    lockRef.current = true
    setState((s) => ({ ...s, isGenerating: true, error: null }))

    try {
      const trimmed = refineText?.trim() || undefined

      const data = await api<PreviewResponse>(
        `/api/request/${requestId}/generate-preview`,
        {
          method: 'POST',
          body: JSON.stringify({ refineText: trimmed }),
        },
      )

      const newPreview: PreviewItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        dataUrl: data.dataUrl,
        mimeType: data.mimeType,
        r2Key: data.r2Key,
        watermarkedR2Key: data.watermarkedR2Key,
        sizeBytes: data.sizeBytes,
        refineText: trimmed,
      }

      setState((s) => ({
        ...s,
        previews: [...s.previews, newPreview],
        selectedPreviewId: newPreview.id,
        isGenerating: false,
        ...applyGenerationStatus(data),
      }))
    } catch (err: unknown) {
      let message = 'Error al generar el diseño. Intenta de nuevo.'
      let statusPatch: Partial<GenerationState> = {}

      if (err instanceof ApiError && err.status === 403) {
        const body = err.body as
          | (PreviewGenerationStatus & {
              message?: string
            })
          | null
        message =
          body?.message ??
          previewGenerationLimitReachedMessage(state.maxGenerations)
        if (body?.maxGenerations !== undefined) {
          statusPatch = applyGenerationStatus(body)
        }
      } else if (err instanceof Error) {
        message = err.message
      }

      setState((s) => ({
        ...s,
        isGenerating: false,
        error: message,
        ...statusPatch,
      }))
    } finally {
      lockRef.current = false
    }
  }
  generatePreviewRef.current = generatePreview

  useEffect(() => {
    if (!requestId) {
      setState((s) => ({
        ...s,
        isStatusLoaded: false,
        generationCount: 0,
        maxGenerations: PREVIEW_GENERATION_LIMIT_DEFAULT,
        canGenerate: true,
      }))
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const status = await api<PreviewGenerationStatus>(
          `/api/request/${requestId}/generation-status`,
        )
        if (cancelled) return
        setState((s) => ({
          ...s,
          isStatusLoaded: true,
          ...applyGenerationStatus(status),
        }))
      } catch {
        if (cancelled) return
        setState((s) => ({ ...s, isStatusLoaded: true }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [requestId])

  useEffect(() => {
    if (!autoGenerate) return
    if (!requestId) return
    if (!state.isStatusLoaded) return
    if (!state.canGenerate) return
    if (state.previews.length > 0) return

    generatePreviewRef.current()
  }, [
    autoGenerate,
    requestId,
    state.isStatusLoaded,
    state.canGenerate,
    state.previews.length,
  ])

  return {
    previews: state.previews,
    selectedPreview,
    selectedPreviewId: state.selectedPreviewId,
    selectPreview,
    attempts: state.generationCount,
    maxAttempts: state.maxGenerations,
    canRegenerate,
    attemptLabel,
    isGenerating: state.isGenerating,
    error: state.error,
    generatePreview,
  }
}
