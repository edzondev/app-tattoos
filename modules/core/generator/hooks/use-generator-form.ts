import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ContactInput, MasterSchemaType } from '@/modules/schemas/tattoo'
import {
  masterSchema,
  stepSchemas,
  TOTAL_STEPS,
} from '@/modules/schemas/tattoo'
import { generatorApi } from '../api'
import { useSteps } from './use-steps'

type Status = 'idle' | 'transitioning' | 'submitting'

export function useGeneratorForm() {
  const {
    step,
    setStep,
    goNext: stepNext,
    goPrev: stepPrev,
    isFirst,
    isLast,
  } = useSteps()
  const [requestId, setRequestId] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [apiError, setApiError] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const closeContactModal = () => setShowContactModal(false)
  const [contactError, setContactError] = useState<string | null>(null)

  const form = useForm<MasterSchemaType>({
    resolver: zodResolver(masterSchema),
    mode: 'onSubmit',
    defaultValues: {
      bodyZone: '',
      colorMode: 'BLACK_AND_GREY',
      detailLevel: 3,
      size: undefined,
      specialInstructions: '',
      style: undefined,
    },
  })

  const goNext = async () => {
    const schema = stepSchemas[step - 1]

    if (schema) {
      const fields = Object.keys(schema.shape) as (keyof MasterSchemaType)[]
      const isValid = await form.trigger(fields)
      if (!isValid) return
    }

    if (step === 1) {
      setShowContactModal(true)
      return
    }

    if (step === 2) {
      setStatus('transitioning')
      setApiError(null)
      if (!requestId) return
      try {
        const values = form.getValues()
        await generatorApi.updateStep2(requestId, values.specialInstructions)
        stepNext()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setApiError(message)
      } finally {
        setStatus('idle')
      }
      return
    }

    stepNext()
  }

  const goPrev = () => {
    stepPrev()
  }

  const handleContactSubmit = async (contact: ContactInput) => {
    setStatus('submitting')
    setContactError(null)
    try {
      const values = form.getValues()
      const res = await generatorApi.createRequest(contact, values)
      setRequestId(res.id)
      setShowContactModal(false)
      setStep(2)
    } catch (err) {
      setContactError(
        err instanceof Error
          ? err.message
          : 'Error al registrar. Intenta de nuevo.',
      )
    } finally {
      setStatus('idle')
    }
  }

  return {
    form,
    step,
    requestId,
    isFirst,
    isLast,
    totalSteps: TOTAL_STEPS,
    isTransitioning: status === 'transitioning',
    isContactSubmitting: status === 'submitting',
    apiError,
    showContactModal,
    closeContactModal,
    contactError,
    goNext,
    goPrev,
    handleContactSubmit,
  }
}
