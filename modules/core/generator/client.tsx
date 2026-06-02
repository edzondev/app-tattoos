'use client'

import dynamic from 'next/dynamic'
import { FormProvider } from 'react-hook-form'
import { useGeneratorForm } from './hooks/use-generator-form'
import BasicStep from './steps/basic-step'
import ReferencesStep from './steps/references-step'
import ResultsStep from './steps/results-step'
import StepIndicator from './steps/step-indicator'

const ContactModal = dynamic(() => import('./steps/contact-modal'), {
  ssr: false,
})

import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'

export default function GeneratorClient() {
  const {
    form,
    step,
    requestId,
    goNext,
    goPrev,
    isFirst,
    isLast,
    isTransitioning,
    apiError,
    showContactModal,
    closeContactModal,
    contactError,
    isContactSubmitting,
    handleContactSubmit,
  } = useGeneratorForm()

  return (
    <FormProvider {...form}>
      <StepIndicator currentStep={step} />
      <div className="min-h-70">
        {step === 1 ? <BasicStep /> : null}
        {step === 2 ? <ReferencesStep /> : null}
        {step === 3 ? <ResultsStep requestId={requestId} /> : null}
      </div>
      <div className="mt-10">
        {apiError ? (
          <p className="mb-2 text-sm text-destructive">{apiError}</p>
        ) : null}
        {isFirst ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={isTransitioning}
            className="w-full font-grotesk font-semibold"
            size="lg"
          >
            {isTransitioning ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Siguiente: Referencias
          </Button>
        ) : null}

        {step === 2 ? (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              disabled={isTransitioning}
              className="font-body"
            >
              <ArrowLeft size={16} />
              Atrás
            </Button>

            <Button
              type="button"
              onClick={goNext}
              disabled={isTransitioning}
              className="flex-1 font-body font-semibold"
              size="lg"
            >
              {isTransitioning ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Generar diseños con IA
            </Button>
          </div>
        ) : null}

        {isLast ? (
          <Button
            type="button"
            variant="ghost"
            onClick={goPrev}
            disabled={isTransitioning}
            className="font-body text-muted-foreground"
          >
            <ArrowLeft size={16} />
            Volver a referencias
          </Button>
        ) : null}
      </div>

      <ContactModal
        isOpen={showContactModal}
        isSubmitting={isContactSubmitting}
        error={contactError}
        onSubmit={handleContactSubmit}
        onClose={closeContactModal}
      />
    </FormProvider>
  )
}
