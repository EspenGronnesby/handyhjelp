import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UseFormSubmitOptions {
  onSuccess?: () => void;
  successMessage?: string;
  successDescription?: string;
  errorMessage?: string;
  errorDescription?: string;
  redirectTo?: string;
}

interface UseFormSubmitReturn<T> {
  submit: (fn: () => Promise<T>) => Promise<T | undefined>;
  isSubmitting: boolean;
}

export function useFormSubmit<T = void>(options: UseFormSubmitOptions = {}): UseFormSubmitReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    onSuccess,
    successMessage = "Sendt!",
    successDescription,
    errorMessage = "Noe gikk galt",
    errorDescription = "Prøv igjen eller kontakt oss direkte.",
    redirectTo,
  } = options;

  const submit = useCallback(async (fn: () => Promise<T>): Promise<T | undefined> => {
    setIsSubmitting(true);

    try {
      const result = await fn();

      if (successMessage) {
        toast({
          title: successMessage,
          description: successDescription,
        });
      }

      onSuccess?.();

      if (redirectTo) {
        navigate(redirectTo);
      }

      return result;
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: errorMessage,
        description: error instanceof Error ? error.message : errorDescription,
        variant: "destructive",
      });
      return undefined;
    } finally {
      setIsSubmitting(false);
    }
  }, [toast, navigate, onSuccess, successMessage, successDescription, errorMessage, errorDescription, redirectTo]);

  return { submit, isSubmitting };
}
