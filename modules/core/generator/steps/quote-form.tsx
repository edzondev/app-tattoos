'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, Loader2, Send } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError, api } from '@/lib/api'
import { Button } from '@/modules/core/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/modules/core/components/ui/field'
import { Input } from '@/modules/core/components/ui/input'
import { Textarea } from '@/modules/core/components/ui/textarea'
import { type QuoteFormInput, QuoteFormSchema } from '@/modules/schemas/tattoo'
import type { PreviewItem } from '../hooks/use-tattoo-generation'

interface QuoteFormProps {
  requestId: string
  selectedPreview: PreviewItem
  onSuccess: (params: SubmitQuoteResponse) => void
  onBack: () => void
}

type SubmitQuoteResponse = {
  requestCode: string
  trackingToken: string
  fullName: string
  designUrl: string
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

export default function QuoteForm({
  requestId,
  selectedPreview,
  onSuccess,
  onBack,
}: QuoteFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormInput>({
    resolver: zodResolver(QuoteFormSchema),
    mode: 'onTouched',
  })

  const isBusy = isSubmitting

  const onSubmit = async (values: QuoteFormInput) => {
    setSubmitError(null)

    try {
      const result = await api<SubmitQuoteResponse>(
        `/api/request/${requestId}/submit-quote`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            r2Key: selectedPreview.r2Key,
            watermarkedR2Key: selectedPreview.watermarkedR2Key,
            mimeType: selectedPreview.mimeType,
            sizeBytes: selectedPreview.sizeBytes,
          }),
        },
      )

      onSuccess(result)
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown> | null
        if (body?.error === 'already_submitted') {
          setSubmitError(
            'Esta solicitud ya fue enviada anteriormente. Recarga la página para comenzar de nuevo.',
          )
          return
        }
      }
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al enviar. Por favor, intenta de nuevo.',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg shadow-sm">
            <Image
              src={selectedPreview.dataUrl}
              alt="Diseño seleccionado"
              width={80}
              height={80}
              unoptimized
              draggable={false}
              className="size-20 object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 select-none bg-[repeating-linear-gradient(-28deg,transparent_0,transparent_22px,rgba(255,255,255,0.18)_24px,rgba(255,255,255,0.18)_26px)]"
            />
          </div>
          <div className="min-w-0">
            <p className="font-bebas text-lg tracking-wide leading-tight">
              Tu diseño seleccionado
            </p>
            <p className="font-grotesk text-sm text-muted-foreground">
              Completa tus datos para enviar la solicitud de cotización.
            </p>
          </div>
        </div>
        <Field>
          <FieldLabel>
            Distrito <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...register('district')}
            placeholder="Ej: Miraflores"
            autoComplete="address-level2"
            disabled={isBusy}
          />
          {errors.district && <FieldError errors={[errors.district]} />}
        </Field>
        <Field>
          <FieldLabel>
            Disponibilidad <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...register('availability')}
            placeholder="Ej: Fines de semana por la tarde"
            disabled={isBusy}
          />
          {errors.availability && <FieldError errors={[errors.availability]} />}
        </Field>
        <Field>
          <FieldLabel>Comentarios adicionales (opcional)</FieldLabel>
          <Textarea
            {...register('extraComments')}
            placeholder="Ej: Tengo sensibilidad en esa zona, prefiero sesiones cortas…"
            className="min-h-20"
            disabled={isBusy}
          />
          {errors.extraComments && (
            <FieldError errors={[errors.extraComments]} />
          )}
        </Field>
        {submitError && <ErrorBanner message={submitError} />}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isBusy}
            className="font-grotesk sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Volver al diseño
          </Button>

          <Button
            type="submit"
            disabled={isBusy}
            className="flex-1 font-grotesk font-semibold"
          >
            {isBusy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando solicitud…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Enviar solicitud de cotización
              </>
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
