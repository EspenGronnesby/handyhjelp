import { useState, useCallback, useMemo } from "react";

interface UseMultiStepFormOptions {
  totalSteps: number;
  initialStep?: number;
  onValidate?: (step: number) => boolean;
}

interface UseMultiStepFormReturn {
  step: number;
  totalSteps: number;
  next: () => boolean;
  back: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  reset: () => void;
}

export function useMultiStepForm({
  totalSteps,
  initialStep = 1,
  onValidate,
}: UseMultiStepFormOptions): UseMultiStepFormReturn {
  const [step, setStep] = useState(initialStep);

  const next = useCallback((): boolean => {
    if (onValidate && !onValidate(step)) {
      return false;
    }
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      return true;
    }
    return false;
  }, [step, totalSteps, onValidate]);

  const back = useCallback(() => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  }, [step]);

  const goToStep = useCallback((targetStep: number) => {
    if (targetStep >= 1 && targetStep <= totalSteps) {
      setStep(targetStep);
    }
  }, [totalSteps]);

  const reset = useCallback(() => {
    setStep(initialStep);
  }, [initialStep]);

  const isFirstStep = step === 1;
  const isLastStep = step === totalSteps;
  const progress = useMemo(() => (step / totalSteps) * 100, [step, totalSteps]);

  return {
    step,
    totalSteps,
    next,
    back,
    goToStep,
    isFirstStep,
    isLastStep,
    progress,
    reset,
  };
}
