'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/modules/core/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/modules/core/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/modules/core/components/ui/field'
import { Input } from '@/modules/core/components/ui/input'
import { type MagicLinkInput, MagicLinkSchema } from '@/modules/schemas/tattoo'

interface MagicLinkFormProps {
  callbackUrl?: string
}

type SubmitState =
  | { type: 'idle' }
  | { type: 'sent'; email: string }
  | { type: 'error'; message: string }

/**
 * Success state after magic link is sent.
 * Isolated to prevent unnecessary re-renders.
 */
function SuccessMessage({
  email,
  onReset,
}: {
  email: string
  onReset: () => void
}) {
  return (
    <section className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="font-bebas text-2xl tracking-wide">
            Revisa tu correo
          </CardTitle>
          <CardDescription>
            Te enviamos un enlace de acceso a{' '}
            <strong className="text-foreground">{email}</strong>. Haz clic en el
            enlace para ingresar al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-grotesk text-sm text-muted-foreground">
            El enlace expira en 10 minutos. Si no lo ves, revisa tu carpeta de
            spam.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-4 w-full"
            onClick={onReset}
          >
            Usar otro email
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}

/**
 * Magic link form with React Hook Form + Zod validation.
 * Handles email submission for passwordless authentication.
 */
export default function MagicLinkForm({
  callbackUrl = '/admin',
}: MagicLinkFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>({ type: 'idle' })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<MagicLinkInput>({
    resolver: zodResolver(MagicLinkSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: MagicLinkInput) => {
    try {
      const { error } = await authClient.signIn.magicLink({
        email: data.email,
        callbackURL: callbackUrl,
      })

      if (error) {
        setSubmitState({
          type: 'error',
          message:
            error.status === 403
              ? 'No estás autorizado para acceder al panel.'
              : 'Ocurrió un error al enviar el enlace. Intenta de nuevo.',
        })
        return
      }

      setSubmitState({ type: 'sent', email: data.email })
    } catch {
      setSubmitState({
        type: 'error',
        message: 'Ocurrió un error inesperado. Intenta más tarde.',
      })
    }
  }

  const handleReset = () => {
    reset()
    setSubmitState({ type: 'idle' })
  }

  // Early return for success state
  if (submitState.type === 'sent') {
    return <SuccessMessage email={submitState.email} onReset={handleReset} />
  }

  return (
    <section className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="font-bebas text-2xl tracking-wide">
            Acceso al panel
          </CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos un enlace de acceso.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              {submitState.type === 'error' && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="font-grotesk text-sm text-destructive">
                    {submitState.message}
                  </p>
                </div>
              )}

              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      autoComplete="email"
                      autoFocus
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Enviando…
                  </span>
                ) : (
                  'Enviar enlace de acceso'
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
