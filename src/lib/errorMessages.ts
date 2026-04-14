/**
 * Norwegian user-friendly error messages
 * Maps technical error codes to readable messages
 */

// Generic error messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Kunne ikke koble til serveren. Sjekk internettforbindelsen din.',
  TIMEOUT: 'Forespørselen tok for lang tid. Prøv igjen.',
  
  // Form validation
  REQUIRED_FIELD: 'Dette feltet er påkrevd',
  INVALID_EMAIL: 'Ugyldig e-postadresse',
  INVALID_PHONE: 'Ugyldig telefonnummer',
  MIN_LENGTH: (min: number) => `Må være minst ${min} tegn`,
  MAX_LENGTH: (max: number) => `Kan ikke være mer enn ${max} tegn`,
  
  // Auth errors
  INVALID_CREDENTIALS: 'Feil e-post eller passord',
  EMAIL_IN_USE: 'Denne e-postadressen er allerede registrert',
  WEAK_PASSWORD: 'Passordet må være minst 8 tegn',
  USER_NOT_FOUND: 'Finner ikke bruker med denne e-postadressen',
  SESSION_EXPIRED: 'Økten din har utløpt. Vennligst logg inn på nytt.',
  
  // Data errors
  NOT_FOUND: 'Finner ikke det du leter etter',
  PERMISSION_DENIED: 'Du har ikke tilgang til dette',
  SAVE_FAILED: 'Kunne ikke lagre. Prøv igjen.',
  DELETE_FAILED: 'Kunne ikke slette. Prøv igjen.',
  LOAD_FAILED: 'Kunne ikke laste inn data. Prøv igjen.',
  
  // File upload
  FILE_TOO_LARGE: 'Filen er for stor. Maks størrelse er 5MB.',
  INVALID_FILE_TYPE: 'Ugyldig filtype. Kun bilder er tillatt.',
  UPLOAD_FAILED: 'Kunne ikke laste opp filen. Prøv igjen.',
  
  // Generic
  UNKNOWN: 'Noe gikk galt. Prøv igjen senere.',
  TRY_AGAIN: 'Prøv igjen',
  CONTACT_SUPPORT: 'Kontakt oss på +47 48122206 hvis problemet vedvarer.',
} as const;

// Map Supabase error codes to user-friendly messages
export const getSupabaseErrorMessage = (error: { message?: string; code?: string } | null): string => {
  if (!error) return ERROR_MESSAGES.UNKNOWN;
  
  const code = error.code?.toLowerCase() || '';
  const message = error.message?.toLowerCase() || '';
  
  // Auth errors
  if (code === 'invalid_credentials' || message.includes('invalid login')) {
    return ERROR_MESSAGES.INVALID_CREDENTIALS;
  }
  if (code === 'email_exists' || message.includes('already registered')) {
    return ERROR_MESSAGES.EMAIL_IN_USE;
  }
  if (message.includes('password') && message.includes('weak')) {
    return ERROR_MESSAGES.WEAK_PASSWORD;
  }
  if (code === 'user_not_found') {
    return ERROR_MESSAGES.USER_NOT_FOUND;
  }
  if (code === 'session_not_found' || message.includes('session')) {
    return ERROR_MESSAGES.SESSION_EXPIRED;
  }
  
  // RLS / Permission errors
  if (message.includes('policy') || message.includes('permission') || code === '42501') {
    return ERROR_MESSAGES.PERMISSION_DENIED;
  }
  
  // Not found
  if (code === 'pgrst116' || message.includes('not found')) {
    return ERROR_MESSAGES.NOT_FOUND;
  }
  
  // Network errors
  if (message.includes('fetch') || message.includes('network')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return ERROR_MESSAGES.UNKNOWN;
};

// Map fetch/API errors to user-friendly messages  
export const getApiErrorMessage = (error: unknown): string => {
  if (!error) return ERROR_MESSAGES.UNKNOWN;
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    }
    if (message.includes('network') || message.includes('offline')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
  }
  
  return ERROR_MESSAGES.UNKNOWN;
};

// Form validation error messages (for Zod schemas)
export const zodErrorMap = {
  required_error: ERROR_MESSAGES.REQUIRED_FIELD,
  invalid_type_error: 'Ugyldig verdi',
};

// Create user-friendly toast content for errors
export const getErrorToast = (error: unknown, context?: string) => {
  let description = '';
  
  if (error && typeof error === 'object' && 'message' in error) {
    description = getSupabaseErrorMessage(error as { message: string; code?: string });
  } else {
    description = getApiErrorMessage(error);
  }
  
  return {
    title: context ? `Feil ved ${context}` : 'Noe gikk galt',
    description,
    variant: 'destructive' as const,
  };
};
