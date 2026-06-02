'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/modules/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/modules/core/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/modules/core/components/ui/field'
import { Input } from '@/modules/core/components/ui/input'
import { type ContactInput, ContactSchema } from '@/modules/schemas/tattoo'

interface ContactModalProps {
  isOpen: boolean
  isSubmitting: boolean
  error: string | null
  onSubmit: (data: ContactInput) => Promise<void>
  onClose?: () => void
}

export default function ContactModal({
  isOpen,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: ContactModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
    mode: 'onTouched',
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle className="font-bebas text-2xl tracking-wide">
            Antes de generar tu diseño
          </DialogTitle>
          <DialogDescription className="font-grotesk text-sm">
            Necesitamos tus datos para asociar el diseño a tu solicitud.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel>
                Nombre completo <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...register('fullName')}
                placeholder="Ej: Valentina Torres"
                autoComplete="name"
                disabled={isSubmitting}
              />
              {errors.fullName && <FieldError errors={[errors.fullName]} />}
            </Field>

            <Field>
              <FieldLabel>
                WhatsApp <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...register('whatsapp')}
                type="tel"
                placeholder="Ej: +51 987 654 321"
                autoComplete="tel"
                disabled={isSubmitting}
              />
              {errors.whatsapp && <FieldError errors={[errors.whatsapp]} />}
            </Field>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p className="font-grotesk text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-grotesk font-semibold"
              size="lg"
            >
              {isSubmitting && (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              )}
              Continuar y generar diseño
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
