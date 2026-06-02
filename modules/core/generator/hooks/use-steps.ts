import { useState } from 'react'
import { TOTAL_STEPS } from '@/modules/schemas/tattoo'

export function useSteps(initialStep: number = 1) {
  const [step, setStep] = useState(initialStep)

  const goNext = () => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const goPrev = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  return {
    step,
    setStep,
    goNext,
    goPrev,
    isFirst: step === 1,
    isLast: step === TOTAL_STEPS,
  }
}
