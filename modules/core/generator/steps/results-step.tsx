'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, RefreshCw, Send } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/modules/core/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/modules/core/components/ui/field'
import { Textarea } from '@/modules/core/components/ui/textarea'
import { type RefineInput, RefineSchema } from '@/modules/schemas/tattoo'
import { useTattooGeneration } from '../hooks/use-tattoo-generation'
import ConfirmationScreen from './confirmation-screen'
import PreviewGallery from './preview-gallery'
import QuoteForm from './quote-form'

interface ResultsStepProps {
  requestId: string | null
}

type SubStep = 'preview' | 'quote' | 'confirmation'

function GeneratingPlaceholder() {
  return (
    <div className="flex h-72 w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="font-grotesk text-sm text-muted-foreground">
          Generando tu diseño con IA…
        </p>
      </div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <p className="font-grotesk text-sm text-destructive">{message}</p>
    </div>
  )
}

export default function ResultsStep({ requestId }: ResultsStepProps) {
  const [subStep, setSubStep] = useState<SubStep>('preview')
  const [confirmation, setConfirmation] = useState<{
    requestCode: string
    trackingToken: string
    fullName: string
    designUrl: string
  } | null>(null)

  const {
    previews,
    selectedPreview,
    selectedPreviewId,
    selectPreview,
    attempts,
    maxAttempts,
    canRegenerate,
    attemptLabel,
    isGenerating,
    error: genError,
    generatePreview,
  } = useTattooGeneration(requestId, true)

  const {
    register,
    getValues,
    formState: { errors: refineErrors },
  } = useForm<RefineInput>({
    resolver: zodResolver(RefineSchema),
    defaultValues: { refineText: '' },
  })

  const hasPreviews = previews.length > 0
  const isBusy = isGenerating

  const handleGenerate = async () => {
    const refineText = getValues('refineText')?.trim() || undefined
    await generatePreview(refineText)
  }

  const handleSendToQuote = () => {
    if (!selectedPreview) return
    setSubStep('quote')
  }

  const handleQuoteSuccess = (params: {
    requestCode: string
    trackingToken: string
    fullName: string
    designUrl: string
  }) => {
    setConfirmation(params)
    setSubStep('confirmation')
  }

  const handleBackToPreview = () => {
    setSubStep('preview')
  }

  if (subStep === 'confirmation' && confirmation) {
    return (
      <ConfirmationScreen
        requestCode={confirmation.requestCode}
        trackingToken={confirmation.trackingToken}
        fullName={confirmation.fullName}
        designUrl={confirmation.designUrl}
      />
    )
  }

  if (subStep === 'quote' && selectedPreview && requestId) {
    return (
      <QuoteForm
        requestId={requestId}
        selectedPreview={selectedPreview}
        onSuccess={handleQuoteSuccess}
        onBack={handleBackToPreview}
      />
    )
  }

  return (
    <FieldGroup>
      <div className="flex flex-col items-center gap-3">
        {selectedPreview ? (
          <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <Image
              src={selectedPreview.dataUrl}
              alt="Vista previa del diseño de tatuaje generado con IA"
              width={800}
              height={800}
              unoptimized
              draggable={false}
              className="h-auto w-full object-contain"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 select-none bg-[repeating-linear-gradient(-28deg,transparent_0,transparent_76px,rgba(255,255,255,0.14)_78px,rgba(255,255,255,0.14)_80px)]"
            >
              <div className="flex h-full w-full -rotate-12 items-center justify-center font-bebas text-5xl tracking-[0.3em] text-white/20">
                INKYRA PREVIEW
              </div>
            </div>
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="font-grotesk text-sm text-muted-foreground">
                    Regenerando…
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <GeneratingPlaceholder />
        )}

        {attemptLabel && (
          <p className="font-grotesk text-xs text-muted-foreground">
            {attemptLabel}
            {attempts >= maxAttempts && (
              <span className="ml-1 font-medium text-destructive">
                — límite alcanzado
              </span>
            )}
          </p>
        )}
      </div>

      <PreviewGallery
        previews={previews}
        selectedId={selectedPreviewId}
        onSelect={selectPreview}
        canAdd={canRegenerate}
        onAdd={handleGenerate}
        disabled={isBusy}
      />
      {hasPreviews && (
        <Field>
          <FieldLabel>Ajustes al diseño (opcional)</FieldLabel>
          <Textarea
            {...register('refineText')}
            placeholder="Ej: más detalle en las sombras, eliminar el fondo, hacerlo más minimalista…"
            className="min-h-20"
            disabled={isBusy}
          />
          {refineErrors.refineText && (
            <FieldError errors={[refineErrors.refineText]} />
          )}
        </Field>
      )}

      {genError && <ErrorBanner message={genError} />}

      {hasPreviews && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Regenerate */}
          <Button
            type="button"
            variant="outline"
            className="flex-1 font-grotesk"
            onClick={handleGenerate}
            disabled={isBusy || !canRegenerate}
            title={
              !canRegenerate
                ? `Límite de ${maxAttempts} intentos alcanzado`
                : undefined
            }
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Regenerar con cambios
          </Button>
          <Button
            type="button"
            className="flex-1 font-grotesk font-semibold"
            onClick={handleSendToQuote}
            disabled={isBusy || !selectedPreview}
          >
            <Send className="size-4" />
            Enviar a cotización
          </Button>
        </div>
      )}
    </FieldGroup>
  )
}
